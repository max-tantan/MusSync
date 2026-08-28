import './Skeleton.css'

export function SkeletonCards({ count = 12 }: { count?: number }) {
  return (
    <div className="grid ske-grid">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="sk-card" aria-hidden="true">
      <div className="sk sk__cover" />
      <div className="sk sk__title" />
      <div className="sk sk__meta" />
      <div className="sk-card__row">
        <span className="sk sk__star" />
        <span className="sk sk__star" />
        <span className="sk sk__star" />
        <span className="sk sk__meta-sk" />
      </div>
    </div>
  )
}

export function SkeletonScoring() {
  return (
    <div className="ske-scoring" aria-hidden="true">
      <div className="ske-scoring__left">
        <div className="sk ske-scoring__num" />
        <div className="sk ske-scoring__stars" />
      </div>
      <div className="ske-scoring__right">
        {[0, 1, 2, 3, 4].map((i) => (
          <div className="ske-scoring__bar" key={i}>
            <span className="sk ske-scoring__label" />
            <span className="sk ske-scoring__track" />
            <span className="sk ske-scoring__count" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonDetail() {
  return (
    <div className="ske-detail" aria-hidden="true">
      <div className="sk ske-detail__cover" />
      <div className="ske-detail__info">
        <div className="sk sk__eyebrow" />
        <div className="sk sk__htitle" />
        <div className="sk sk__hline sk__hline--mid" />
        <div className="ske-detail__tags">
          <span className="sk sk__tag" />
          <span className="sk sk__tag" />
          <span className="sk sk__tag" />
        </div>
        <div className="sk sk__hline" />
        <div className="sk sk__hline" />
        <div className="sk sk__hline sk__hline--short" />
        <div className="ske-detail__tracks">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div className="ske-detail__track" key={i}>
              <span className="sk sk__num" />
              <span className="sk sk__trackline" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}