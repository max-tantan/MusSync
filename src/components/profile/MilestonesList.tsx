import type { Milestone } from '../../utils/profile'
import { TrophyIcon } from '../icons'
import './MilestonesList.css'

export default function MilestonesList({
  milestones,
}: {
  milestones: Milestone[]
}) {
  return (
    <div className="milestones">
      {milestones.map((m) => (
        <div
          className={`milestone${m.achieved ? ' is-done' : ' is-locked'}`}
          key={m.id}
        >
          <span className="milestone__badge" aria-hidden="true">
            <TrophyIcon size={18} />
          </span>
          <div className="milestone__body">
            <strong>{m.label}</strong>
            <span>{m.description}</span>
          </div>
          <span className="milestone__status">
            {m.achieved ? 'tercapai' : 'terkunci'}
          </span>
        </div>
      ))}
    </div>
  )
}
