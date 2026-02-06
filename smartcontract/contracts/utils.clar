;; @clarity-version 2
;; KoloX Utility Functions

(define-read-only (calculate-fee (amount uint) (fee-percent uint))
  (/ (* amount fee-percent) u100)
)

(define-read-only (is-valid-frequency (frequency uint))
  (or (is-eq frequency u1008) (is-eq frequency u4320))
)
