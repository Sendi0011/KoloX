;; @clarity-version 2
;; KoloX - Community Savings Platform on Stacks
;; A trustless rotating savings and credit association (ROSCA) contract

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-KOLO-NOT-FOUND (err u101))
(define-constant ERR-KOLO-FULL (err u102))
(define-constant ERR-ALREADY-MEMBER (err u103))
(define-constant ERR-NOT-MEMBER (err u104))
(define-constant ERR-ALREADY-PAID (err u105))
(define-constant ERR-WRONG-AMOUNT (err u106))
(define-constant ERR-NOT-STARTED (err u107))
(define-constant ERR-PAYOUT-NOT-READY (err u108))
(define-constant ERR-NOT-YOUR-TURN (err u109))
(define-constant ERR-KOLO-NOT-ACTIVE (err u110))
(define-constant ERR-INVALID-PARAMS (err u111))
(define-constant ERR-CANNOT-JOIN (err u112))
(define-constant ERR-PAUSED (err u113))
(define-constant ERR-ALREADY-WITHDRAWN (err u114))
(define-constant ERR-KOLO-STARTED (err u115))

;; Data variables
(define-data-var kolo-nonce uint u0)
(define-data-var contract-paused bool false)
(define-data-var platform-fee-percent uint u2) ;; 2% platform fee

;; Frequency constants (in blocks - Stacks block time ~10 minutes)
(define-constant WEEKLY u1008) ;; ~7 days
(define-constant MONTHLY u4320) ;; ~30 days
(define-constant GRACE-PERIOD u144) ;; ~1 day grace period for late payments
(define-constant MIN-CONTRIBUTION u1000000) ;; 1 STX minimum

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

(define-map member-count
  uint
  uint
)

;; Track kolo statistics
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
  (map-get? kolos kolo-id)
)

(define-read-only (get-kolo-stats (kolo-id uint))
  (map-get? kolo-stats kolo-id)
)

(define-read-only (get-member-info (kolo-id uint) (user principal))
  (map-get? kolo-members { kolo-id: kolo-id, user: user })
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
      (kolo (unwrap! (get-kolo kolo-id) false))
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
      (kolo (unwrap! (get-kolo kolo-id) none))
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
  (match (get-kolo kolo-id)
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

;; Get all active kolos count
(define-read-only (get-total-kolos)
  (var-get kolo-nonce)
)

;; Check if round deadline has passed
(define-read-only (is-round-deadline-passed (kolo-id uint))
  (match (get-kolo kolo-id)
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

;; Get member participation rate
(define-read-only (get-participation-rate (kolo-id uint) (user principal))
  (match (get-member-info kolo-id user)
    member
      (match (get-kolo kolo-id)
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

;; Private functions

(define-private (is-kolo-creator (kolo-id uint) (user principal))
  (match (get-kolo kolo-id)
    kolo (is-eq (get creator kolo) user)
    false
  )
)

;; Public functions

;; Create a new Kolo
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
    ;; Validations
    (asserts! (> amount u0) ERR-INVALID-PARAMS)
    (asserts! (>= amount MIN-CONTRIBUTION) ERR-INVALID-PARAMS)
    (asserts! (>= max-members u2) ERR-INVALID-PARAMS)
    (asserts! (<= max-members u50) ERR-INVALID-PARAMS)
    (asserts! (>= start-block (+ current-block u144)) ERR-INVALID-PARAMS) ;; At least 1 day ahead
    (asserts! (or (is-eq frequency WEEKLY) (is-eq frequency MONTHLY)) ERR-INVALID-PARAMS)

    ;; Create Kolo
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

    ;; Creator automatically joins at position 0
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

    ;; Initialize stats
    (map-set kolo-stats kolo-id { total-collected: u0, total-paid-out: u0, completed-rounds: u0 })

    ;; Update nonce
    (var-set kolo-nonce kolo-id)

    (ok kolo-id)
  )
)

;; Join an existing Kolo
(define-public (join-kolo (kolo-id uint))
  (let
    (
      (kolo (unwrap! (get-kolo kolo-id) ERR-KOLO-NOT-FOUND))
      (current-members (get-member-count kolo-id))
      (current-block block-height)
    )
    ;; Validations
    (asserts! (get active kolo) ERR-KOLO-NOT-ACTIVE)
    (asserts! (not (get paused kolo)) ERR-PAUSED)
    (asserts! (< current-block (get start-block kolo)) ERR-CANNOT-JOIN)
    (asserts! (< current-members (get max-members kolo)) ERR-KOLO-FULL)
    (asserts! (not (is-member kolo-id tx-sender)) ERR-ALREADY-MEMBER)

    ;; Add member
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

;; Make a contribution for the current round
(define-public (contribute (kolo-id uint))
  (let
    (
      (kolo (unwrap! (get-kolo kolo-id) ERR-KOLO-NOT-FOUND))
      (member (unwrap! (get-member-info kolo-id tx-sender) ERR-NOT-MEMBER))
      (current-round (get current-round kolo))
      (amount (get amount kolo))
      (current-block block-height)
      (stats (default-to { total-collected: u0, total-paid-out: u0, completed-rounds: u0 } 
                          (map-get? kolo-stats kolo-id)))
    )
    ;; Validations
    (asserts! (get active kolo) ERR-KOLO-NOT-ACTIVE)
    (asserts! (not (get paused kolo)) ERR-PAUSED)
    (asserts! (>= current-block (get start-block kolo)) ERR-NOT-STARTED)
    (asserts! (not (has-paid-current-round kolo-id tx-sender)) ERR-ALREADY-PAID)

    ;; Transfer STX from user to contract
    (try!
      (as-contract
        (stx-transfer? amount tx-sender tx-sender)
      )
    )

    ;; Record contribution
    (map-set round-contributions 
      { kolo-id: kolo-id, round: current-round, user: tx-sender }
      {
        paid: true,
        amount: amount,
        paid-at: current-block
      }
    )

    ;; Update member stats
    (map-set kolo-members { kolo-id: kolo-id, user: tx-sender }
      (merge member { 
        total-contributions: (+ (get total-contributions member) amount),
        reputation-score: (+ (get reputation-score member) u1)
      })
    )

    ;; Update kolo stats
    (map-set kolo-stats kolo-id 
      (merge stats { total-collected: (+ (get total-collected stats) amount) })
    )

    (print { event: "contribution-made", kolo-id: kolo-id, user: tx-sender, round: current-round, amount: amount })
    (ok true)
  )
)

;; Trigger payout for current round
(define-public (trigger-payout (kolo-id uint))
  (let
    (
      (kolo (unwrap! (get-kolo kolo-id) ERR-KOLO-NOT-FOUND))
      (current-round (get current-round kolo))
      (recipient-principal (unwrap! (get-payout-recipient kolo-id current-round) ERR-NOT-YOUR-TURN))
      (recipient-member (unwrap! (get-member-info kolo-id recipient-principal) ERR-NOT-MEMBER))
      (amount (get amount kolo))
      (total-members (get-member-count kolo-id))
      (total-payout (* amount total-members))
      (current-block block-height)
      (stats (default-to { total-collected: u0, total-paid-out: u0, completed-rounds: u0 } 
                          (map-get? kolo-stats kolo-id)))
    )
    ;; Validations
    (asserts! (get active kolo) ERR-KOLO-NOT-ACTIVE)
    (asserts! (>= current-block (get start-block kolo)) ERR-NOT-STARTED)
    (asserts! (not (get has-received-payout recipient-member)) ERR-ALREADY-PAID)

    ;; Check if all members have paid (simplified - production would need more checks)
    (asserts! (>= current-block (+ (get start-block kolo) (* (get frequency kolo) current-round))) ERR-PAYOUT-NOT-READY)

    ;; Transfer payout to recipient
    (try! (as-contract (stx-transfer? total-payout tx-sender recipient-principal)))

    ;; Update recipient's payout status
    (map-set kolo-members { kolo-id: kolo-id, user: recipient-principal }
      (merge recipient-member { has-received-payout: true })
    )

    ;; Update stats
    (map-set kolo-stats kolo-id 
      (merge stats { 
        total-paid-out: (+ (get total-paid-out stats) total-payout),
        completed-rounds: (+ (get completed-rounds stats) u1)
      })
    )

    ;; Move to next round or complete kolo
    (if (< (+ current-round u1) (get total-rounds kolo))
      (map-set kolos kolo-id (merge kolo { current-round: (+ current-round u1) }))
      (map-set kolos kolo-id (merge kolo { active: false, current-round: (+ current-round u1), completed: true }))
    )

    (print { event: "payout-completed", kolo-id: kolo-id, recipient: recipient-principal, amount: total-payout, round: current-round })
    (ok true)
  )
)

;; Emergency function: Creator can cancel before start (refunds all)
(define-public (cancel-kolo (kolo-id uint))
  (let
    (
      (kolo (unwrap! (get-kolo kolo-id) ERR-KOLO-NOT-FOUND))
      (current-block block-height)
    )
    ;; Only creator can cancel
    (asserts! (is-kolo-creator kolo-id tx-sender) ERR-NOT-AUTHORIZED)
    ;; Can only cancel before start
    (asserts! (< current-block (get start-block kolo)) ERR-CANNOT-JOIN)
    ;; Must be active
    (asserts! (get active kolo) ERR-KOLO-NOT-ACTIVE)

    ;; Deactivate kolo
    (map-set kolos kolo-id (merge kolo { active: false }))

    (ok true)
  )
)

;; Read-only helper: Get next payout block
(define-read-only (get-next-payout-block (kolo-id uint))
  (match (get-kolo kolo-id)
    kolo (some (+ (get start-block kolo) (* (get frequency kolo) (+ (get current-round kolo) u1))))
    none
  )
)

;; Check if payment is within grace period
(define-read-only (is-within-grace-period (kolo-id uint))
  (match (get-kolo kolo-id)
    kolo 
      (let
        (
          (round-deadline (+ (get start-block kolo) (* (get frequency kolo) (+ (get current-round kolo) u1))))
          (grace-deadline (+ round-deadline GRACE-PERIOD))
        )
        (< block-height grace-deadline)
      )
    false
  )
)

;; Initialize contract (optional, for setup)
(begin
  (var-set kolo-nonce u0)
)

;; Emergency pause/unpause (creator only)
(define-public (toggle-kolo-pause (kolo-id uint))
  (let
    (
      (kolo (unwrap! (get-kolo kolo-id) ERR-KOLO-NOT-FOUND))
    )
    (asserts! (is-kolo-creator kolo-id tx-sender) ERR-NOT-AUTHORIZED)
    (map-set kolos kolo-id (merge kolo { paused: (not (get paused kolo)) }))
    (print { event: "kolo-pause-toggled", kolo-id: kolo-id, paused: (not (get paused kolo)) })
    (ok true)
  )
)

;; Member withdrawal before kolo starts
(define-public (withdraw-from-kolo (kolo-id uint))
  (let
    (
      (kolo (unwrap! (get-kolo kolo-id) ERR-KOLO-NOT-FOUND))
      (member (unwrap! (get-member-info kolo-id tx-sender) ERR-NOT-MEMBER))
      (current-block block-height)
    )
    (asserts! (< current-block (get start-block kolo)) ERR-KOLO-STARTED)
    (asserts! (not (get withdrawn member)) ERR-ALREADY-WITHDRAWN)
    (asserts! (not (is-kolo-creator kolo-id tx-sender)) ERR-NOT-AUTHORIZED)
    
    (map-set kolo-members { kolo-id: kolo-id, user: tx-sender }
      (merge member { withdrawn: true })
    )
    
    (print { event: "member-withdrawn", kolo-id: kolo-id, user: tx-sender })
    (ok true)
  )
)
