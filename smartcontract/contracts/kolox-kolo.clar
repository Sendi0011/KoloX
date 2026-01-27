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

;; Data variables
(define-data-var kolo-nonce uint u0)

;; Frequency constants (in blocks - Stacks block time ~10 minutes)
(define-constant WEEKLY u1008) ;; ~7 days
(define-constant MONTHLY u4320) ;; ~30 days

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
    created-at: uint
  }
)

(define-map kolo-members
  { kolo-id: uint, user: principal }
  {
    joined-at: uint,
    position: uint,
    total-contributions: uint,
    missed-payments: uint,
    has-received-payout: bool
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

;; Read-only functions

(define-read-only (get-kolo (kolo-id uint))
  (map-get? kolos kolo-id)
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
        created-at: current-block
      }
    )

    ;; Creator automatically joins at position 0
    (map-set kolo-members { kolo-id: kolo-id, user: tx-sender }
      {
        joined-at: current-block,
        position: u0,
        total-contributions: u0,
        missed-payments: u0,
        has-received-payout: false
      }
    )

    (map-set payout-order { kolo-id: kolo-id, position: u0 } tx-sender)
    (map-set member-count kolo-id u1)

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
        has-received-payout: false
      }
    )

    (map-set payout-order { kolo-id: kolo-id, position: current-members } tx-sender)
    (map-set member-count kolo-id (+ current-members u1))

    (ok true)
  )
)

