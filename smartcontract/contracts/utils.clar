;; @clarity-version 2
;; KoloX Utility Functions

;; Calculate percentage fee
(define-read-only (calculate-fee (amount uint) (fee-percent uint))
  (/ (* amount fee-percent) u100)
)

;; Validate frequency value
(define-read-only (is-valid-frequency (frequency uint))
  (or (is-eq frequency u1008) (is-eq frequency u4320))
)

;; Calculate blocks from days
(define-read-only (days-to-blocks (days uint))
  (* days u144)
)

;; Calculate deadline with grace period
(define-read-only (add-grace-period (deadline uint))
  (+ deadline u144)
)

;; Calculate percentage
(define-read-only (calculate-percentage (value uint) (total uint))
  (if (> total u0)
    (some (/ (* value u100) total))
    none
  )
)
