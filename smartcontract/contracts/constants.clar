;; @clarity-version 2
;; KoloX Constants

;; Version
(define-constant CONTRACT-VERSION u1)

;; Error codes - Authorization
(define-constant ERR-NOT-AUTHORIZED (err u100))

;; Error codes - Kolo state
(define-constant ERR-KOLO-NOT-FOUND (err u101))
(define-constant ERR-KOLO-FULL (err u102))
(define-constant ERR-KOLO-NOT-ACTIVE (err u110))
(define-constant ERR-PAUSED (err u113))
(define-constant ERR-KOLO-STARTED (err u115))

;; Error codes - Membership
(define-constant ERR-ALREADY-MEMBER (err u103))
(define-constant ERR-NOT-MEMBER (err u104))
(define-constant ERR-ALREADY-WITHDRAWN (err u114))

;; Error codes - Payments
(define-constant ERR-ALREADY-PAID (err u105))
(define-constant ERR-WRONG-AMOUNT (err u106))
(define-constant ERR-NOT-STARTED (err u107))
(define-constant ERR-PAYOUT-NOT-READY (err u108))
(define-constant ERR-NOT-YOUR-TURN (err u109))

;; Error codes - Validation
(define-constant ERR-INVALID-PARAMS (err u111))
(define-constant ERR-CANNOT-JOIN (err u112))

;; Frequency constants (in blocks - Stacks block time ~10 minutes)
(define-constant WEEKLY u1008) ;; ~7 days
(define-constant MONTHLY u4320) ;; ~30 days
(define-constant GRACE-PERIOD u144) ;; ~1 day grace period
(define-constant MIN-CONTRIBUTION u1000000) ;; 1 STX minimum
(define-constant MAX-MEMBERS u50) ;; Maximum members per kolo
(define-constant MIN-MEMBERS u2) ;; Minimum members per kolo
(define-constant BLOCKS-PER-DAY u144) ;; ~10 min per block
