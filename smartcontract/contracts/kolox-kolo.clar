;; @clarity-version 2
;; KoloX - Community Savings Platform on Stacks
;; A trustless rotating savings and credit association (ROSCA) contract

;; Contract version
(define-constant CONTRACT-VERSION u1)

;; Data variables
(define-data-var kolo-nonce uint u0)
(define-data-var contract-paused bool false)
(define-data-var platform-fee-percent uint u2)

;; Data maps
(define-map kolos
  uint
  {
    creator: principal,
    name: (string-ascii 50),
    amount: uint,
    frequency: uint,
    max-members: uint,
    current-round: uint,
    start-block: uint,
    total-rounds: uint,
    active: bool,
    created-at: uint,
    paused: bool,
    completed: bool
  }
)

(define-map kolo-members
  { kolo-id: uint, user: principal }
  {
    joined-at: uint,
    position: uint,
    total-contributions: uint,
    missed-payments: uint,
    has-received-payout: bool,
    reputation-score: uint,
    withdrawn: bool
  }
)

(define-map round-contributions
  { kolo-id: uint, round: uint, user: principal }
  {
    paid: bool,
    amount: uint,
    paid-at: uint
  }
)

(define-map payout-order
  { kolo-id: uint, position: uint }
  principal
)

(define-map member-count uint uint)

(define-map kolo-stats
  uint
  {
    total-collected: uint,
    total-paid-out: uint,
    completed-rounds: uint
  }
)

;; Read-only functions
(define-read-only (get-kolo (kolo-id uint))
  (ok (map-get? kolos kolo-id))
)

(define-read-only (get-kolo-stats (kolo-id uint))
  (map-get? kolo-stats kolo-id)
)

(define-read-only (get-total-collected (kolo-id uint))
  (match (get-kolo-stats kolo-id)
    stats (some (get total-collected stats))
    none
  )
)

(define-read-only (get-member-info (kolo-id uint) (user principal))
  (map-get? kolo-members { kolo-id: kolo-id, user: user })
)

(define-read-only (get-member-position (kolo-id uint) (user principal))
  (match (get-member-info kolo-id user)
    member (some (get position member))
    none
  )
)

(define-read-only (get-member-count (kolo-id uint))
  (default-to u0 (map-get? member-count kolo-id))
)

(define-read-only (get-payout-recipient (kolo-id uint) (position uint))
  (map-get? payout-order { kolo-id: kolo-id, position: position })
)

(define-read-only (has-paid-current-round (kolo-id uint) (user principal))
  (let
    (
      (kolo (unwrap! (ok (map-get? kolos kolo-id)) false))
      (current-round (get current-round kolo))
    )
    (default-to false 
      (get paid (map-get? round-contributions 
        { kolo-id: kolo-id, round: current-round, user: user }
      ))
    )
  )
)

(define-read-only (get-current-round-recipient (kolo-id uint))
  (let
    (
      (kolo (unwrap! (ok (map-get? kolos kolo-id)) none))
      (current-round (get current-round kolo))
    )
    (get-payout-recipient kolo-id current-round)
  )
)

(define-read-only (is-member (kolo-id uint) (user principal))
  (is-some (get-member-info kolo-id user))
)

(define-read-only (get-round-contribution (kolo-id uint) (round uint) (user principal))
  (map-get? round-contributions { kolo-id: kolo-id, round: round, user: user })
)

(define-read-only (is-kolo-completed (kolo-id uint))
  (match (map-get? kolos kolo-id)
    kolo (get completed kolo)
    false
  )
)

(define-read-only (get-platform-fee-percent)
  (var-get platform-fee-percent)
)

(define-read-only (calculate-platform-fee (amount uint))
  (/ (* amount (var-get platform-fee-percent)) u100)
)

(define-read-only (get-total-kolos)
  (var-get kolo-nonce)
)

(define-read-only (get-contract-version)
  CONTRACT-VERSION
)

(define-read-only (is-round-deadline-passed (kolo-id uint))
  (match (map-get? kolos kolo-id)
    kolo 
      (let
        (
          (round-deadline (+ (get start-block kolo) (* (get frequency kolo) (+ (get current-round kolo) u1))))
        )
        (>= block-height round-deadline)
      )
    false
  )
)

(define-read-only (get-participation-rate (kolo-id uint) (user principal))
  (match (get-member-info kolo-id user)
    member
      (match (map-get? kolos kolo-id)
        kolo
          (let
            (
              (expected-contributions (get current-round kolo))
              (actual-contributions (get total-contributions member))
              (contribution-amount (get amount kolo))
            )
            (if (> expected-contributions u0)
              (some (/ (* actual-contributions u100) (* expected-contributions contribution-amount)))
              (some u0)
            )
          )
        none
      )
    none
  )
)

(define-read-only (get-next-payout-block (kolo-id uint))
  (match (map-get? kolos kolo-id)
    kolo (some (+ (get start-block kolo) (* (get frequency kolo) (+ (get current-round kolo) u1))))
    none
  )
)

(define-read-only (is-within-grace-period (kolo-id uint))
  (match (map-get? kolos kolo-id)
    kolo 
      (let
        (
          (round-deadline (+ (get start-block kolo) (* (get frequency kolo) (+ (get current-round kolo) u1))))
          (grace-deadline (+ round-deadline (unwrap-panic (contract-call? .constants GRACE-PERIOD))))
        )
        (< block-height grace-deadline)
      )
    false
  )
)

(define-private (is-kolo-creator (kolo-id uint) (user principal))
  (match (map-get? kolos kolo-id)
    kolo (is-eq (get creator kolo) user)
    false
  )
)

;; Public functions
(define-public (create-kolo 
    (name (string-ascii 50))
    (amount uint)
    (frequency uint)
    (max-members uint)
    (start-block uint)
  )
  (let
    (
      (kolo-id (+ (var-get kolo-nonce) u1))
      (current-block block-height)
    )
    (asserts! (> amount u0) (contract-call? .constants ERR-INVALID-PARAMS))
    (asserts! (>= amount (unwrap-panic (contract-call? .constants MIN-CONTRIBUTION))) (contract-call? .constants ERR-INVALID-PARAMS))
    (asserts! (>= max-members (unwrap-panic (contract-call? .constants MIN-MEMBERS))) (contract-call? .constants ERR-INVALID-PARAMS))
    (asserts! (<= max-members (unwrap-panic (contract-call? .constants MAX-MEMBERS))) (contract-call? .constants ERR-INVALID-PARAMS))
    (asserts! (>= start-block (+ current-block u144)) (contract-call? .constants ERR-INVALID-PARAMS))
    (asserts! (or (is-eq frequency (unwrap-panic (contract-call? .constants WEEKLY))) 
                  (is-eq frequency (unwrap-panic (contract-call? .constants MONTHLY)))) 
              (contract-call? .constants ERR-INVALID-PARAMS))

    (map-set kolos kolo-id
      {
        creator: tx-sender,
        name: name,
        amount: amount,
        frequency: frequency,
        max-members: max-members,
        current-round: u0,
        start-block: start-block,
        total-rounds: max-members,
        active: true,
        created-at: current-block,
        paused: false,
        completed: false
      }
    )

    (map-set kolo-members { kolo-id: kolo-id, user: tx-sender }
      {
        joined-at: current-block,
        position: u0,
        total-contributions: u0,
        missed-payments: u0,
        has-received-payout: false,
        reputation-score: u100,
        withdrawn: false
      }
    )

    (map-set payout-order { kolo-id: kolo-id, position: u0 } tx-sender)
    (map-set member-count kolo-id u1)
    (map-set kolo-stats kolo-id { total-collected: u0, total-paid-out: u0, completed-rounds: u0 })
    (var-set kolo-nonce kolo-id)

    (ok kolo-id)
  )
)

(define-public (join-kolo (kolo-id uint))
  (let
    (
      (kolo (unwrap! (ok (map-get? kolos kolo-id)) (contract-call? .constants ERR-KOLO-NOT-FOUND)))
      (current-members (get-member-count kolo-id))
      (current-block block-height)
    )
    (asserts! (get active kolo) (contract-call? .constants ERR-KOLO-NOT-ACTIVE))
    (asserts! (not (get paused kolo)) (contract-call? .constants ERR-PAUSED))
    (asserts! (< current-block (get start-block kolo)) (contract-call? .constants ERR-CANNOT-JOIN))
    (asserts! (< current-members (get max-members kolo)) (contract-call? .constants ERR-KOLO-FULL))
    (asserts! (not (is-member kolo-id tx-sender)) (contract-call? .constants ERR-ALREADY-MEMBER))

    (map-set kolo-members { kolo-id: kolo-id, user: tx-sender }
      {
        joined-at: current-block,
        position: current-members,
        total-contributions: u0,
        missed-payments: u0,
        has-received-payout: false,
        reputation-score: u100,
        withdrawn: false
      }
    )

    (map-set payout-order { kolo-id: kolo-id, position: current-members } tx-sender)
    (map-set member-count kolo-id (+ current-members u1))

    (ok true)
  )
)

(define-public (contribute (kolo-id uint))
  (let
    (
      (kolo (unwrap! (ok (map-get? kolos kolo-id)) (contract-call? .constants ERR-KOLO-NOT-FOUND)))
      (member (unwrap! (get-member-info kolo-id tx-sender) (contract-call? .constants ERR-NOT-MEMBER)))
      (current-round (get current-round kolo))
      (amount (get amount kolo))
      (current-block block-height)
      (stats (default-to { total-collected: u0, total-paid-out: u0, completed-rounds: u0 } 
                          (map-get? kolo-stats kolo-id)))
    )
    (asserts! (get active kolo) (contract-call? .constants ERR-KOLO-NOT-ACTIVE))
    (asserts! (not (get paused kolo)) (contract-call? .constants ERR-PAUSED))
    (asserts! (>= current-block (get start-block kolo)) (contract-call? .constants ERR-NOT-STARTED))
    (asserts! (not (has-paid-current-round kolo-id tx-sender)) (contract-call? .constants ERR-ALREADY-PAID))

    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))

    (map-set round-contributions 
      { kolo-id: kolo-id, round: current-round, user: tx-sender }
      {
        paid: true,
        amount: amount,
        paid-at: current-block
      }
    )

    (map-set kolo-members { kolo-id: kolo-id, user: tx-sender }
      (merge member { 
        total-contributions: (+ (get total-contributions member) amount),
        reputation-score: (+ (get reputation-score member) u1)
      })
    )

    (map-set kolo-stats kolo-id 
      (merge stats { total-collected: (+ (get total-collected stats) amount) })
    )

    (print { event: "contribution-made", kolo-id: kolo-id, user: tx-sender, round: current-round, amount: amount })
    (ok true)
  )
)

(define-public (trigger-payout (kolo-id uint))
  (let
    (
      (kolo (unwrap! (ok (map-get? kolos kolo-id)) (contract-call? .constants ERR-KOLO-NOT-FOUND)))
      (current-round (get current-round kolo))
      (recipient-principal (unwrap! (get-payout-recipient kolo-id current-round) (contract-call? .constants ERR-NOT-YOUR-TURN)))
      (recipient-member (unwrap! (get-member-info kolo-id recipient-principal) (contract-call? .constants ERR-NOT-MEMBER)))
      (amount (get amount kolo))
      (total-members (get-member-count kolo-id))
      (total-payout (* amount total-members))
      (current-block block-height)
      (stats (default-to { total-collected: u0, total-paid-out: u0, completed-rounds: u0 } 
                          (map-get? kolo-stats kolo-id)))
    )
    (asserts! (get active kolo) (contract-call? .constants ERR-KOLO-NOT-ACTIVE))
    (asserts! (>= current-block (get start-block kolo)) (contract-call? .constants ERR-NOT-STARTED))
    (asserts! (not (get has-received-payout recipient-member)) (contract-call? .constants ERR-ALREADY-PAID))
    (asserts! (>= current-block (+ (get start-block kolo) (* (get frequency kolo) current-round))) (contract-call? .constants ERR-PAYOUT-NOT-READY))

    (try! (as-contract (stx-transfer? total-payout tx-sender recipient-principal)))

    (map-set kolo-members { kolo-id: kolo-id, user: recipient-principal }
      (merge recipient-member { has-received-payout: true })
    )

    (map-set kolo-stats kolo-id 
      (merge stats { 
        total-paid-out: (+ (get total-paid-out stats) total-payout),
        completed-rounds: (+ (get completed-rounds stats) u1)
      })
    )

    (if (< (+ current-round u1) (get total-rounds kolo))
      (map-set kolos kolo-id (merge kolo { current-round: (+ current-round u1) }))
      (map-set kolos kolo-id (merge kolo { active: false, current-round: (+ current-round u1), completed: true }))
    )

    (print { event: "payout-completed", kolo-id: kolo-id, recipient: recipient-principal, amount: total-payout, round: current-round })
    (ok true)
  )
)

(define-public (cancel-kolo (kolo-id uint))
  (let
    (
      (kolo (unwrap! (ok (map-get? kolos kolo-id)) (contract-call? .constants ERR-KOLO-NOT-FOUND)))
      (current-block block-height)
    )
    (asserts! (is-kolo-creator kolo-id tx-sender) (contract-call? .constants ERR-NOT-AUTHORIZED))
    (asserts! (< current-block (get start-block kolo)) (contract-call? .constants ERR-CANNOT-JOIN))
    (asserts! (get active kolo) (contract-call? .constants ERR-KOLO-NOT-ACTIVE))

    (map-set kolos kolo-id (merge kolo { active: false }))

    (ok true)
  )
)

(define-public (toggle-kolo-pause (kolo-id uint))
  (let
    (
      (kolo (unwrap! (ok (map-get? kolos kolo-id)) (contract-call? .constants ERR-KOLO-NOT-FOUND)))
    )
    (asserts! (is-kolo-creator kolo-id tx-sender) (contract-call? .constants ERR-NOT-AUTHORIZED))
    (map-set kolos kolo-id (merge kolo { paused: (not (get paused kolo)) }))
    (print { event: "kolo-pause-toggled", kolo-id: kolo-id, paused: (not (get paused kolo)) })
    (ok true)
  )
)

(define-public (withdraw-from-kolo (kolo-id uint))
  (let
    (
      (kolo (unwrap! (ok (map-get? kolos kolo-id)) (contract-call? .constants ERR-KOLO-NOT-FOUND)))
      (member (unwrap! (get-member-info kolo-id tx-sender) (contract-call? .constants ERR-NOT-MEMBER)))
      (current-block block-height)
    )
    (asserts! (< current-block (get start-block kolo)) (contract-call? .constants ERR-KOLO-STARTED))
    (asserts! (not (get withdrawn member)) (contract-call? .constants ERR-ALREADY-WITHDRAWN))
    (asserts! (not (is-kolo-creator kolo-id tx-sender)) (contract-call? .constants ERR-NOT-AUTHORIZED))
    
    (map-set kolo-members { kolo-id: kolo-id, user: tx-sender }
      (merge member { withdrawn: true })
    )
    
    (print { event: "member-withdrawn", kolo-id: kolo-id, user: tx-sender })
    (ok true)
  )
)

(begin
  (var-set kolo-nonce u0)
)
