;; @clarity-version 2
;; KoloX Traits - Interface definitions

(define-trait kolo-trait
  (
    ;; Core functions
    (create-kolo ((string-ascii 50) uint uint uint uint) (response uint uint))
    (join-kolo (uint) (response bool uint))
    (contribute (uint) (response bool uint))
    (trigger-payout (uint) (response bool uint))
    
    ;; Read-only functions
    (get-kolo (uint) (response {
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
    } uint))
    (get-member-count (uint) (response uint uint))
    (is-member (uint principal) (response bool uint))
  )
)
