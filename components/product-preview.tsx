"use client";
import { useState } from "react";
import { Elevation, FloorPlan, Mark, Terrain } from "./artwork";

export const featureNames = [
  "One View",
  "Approval Queue",
  "Full History",
  "Team View",
  "Firm Standards",
];
export function ActivityPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`activity-panel ${compact ? "compact" : ""}`}>
      <div className="preview-stats">
        {[
          ["ACTIVE", "8"],
          ["PENDING", "4"],
          ["MODEL HEALTH", "94%"],
          ["TIME SAVED", "16.8 hrs"],
        ].map(([label, value], i) => (
          <div key={label}>
            <span>
              {label}
              <i className={`status-dot dot-${i}`} />
            </span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="preview-heading">
        <span>WELCOME BACK, ALEX</span>
        <small>Project intelligence / live activity</small>
      </div>
      <div className="activity-title">
        AI ACTIVITY <span>VIEW ALL ↗</span>
      </div>
      {[
        "RESIDENTIAL TOWER / EGRESS",
        "COMMUNITY PAVILION / COORDINATION",
        "LIBRARY / ACCESSIBILITY",
        "RIVERSIDE OFFICES / MODEL HEALTH",
      ].map((title, i) => (
        <div className="activity-row" key={title}>
          <Mark />
          <div>
            <b>{title}</b>
            <p>
              {
                [
                  "Updated circulation clearance",
                  "Checking model against firm standards",
                  "Review required · door clearance",
                  "Model inspection complete",
                ][i]
              }
            </p>
            <small>{i + 2} minutes ago</small>
          </div>
          <span>{["REVIEW", "CHECKING", "PENDING", "COMPLETE"][i]}</span>
        </div>
      ))}
    </div>
  );
}
export function ApprovalCard() {
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(
    null,
  );
  return (
    <div className="approval-card">
      <div className="preview-dark-title">
        PROPOSED CHANGE <span>REV. 04</span>
      </div>
      <p>
        Raise the ceiling in the large meeting room by 120mm (2800 → 2920mm).
      </p>
      <div className="approval-detail mono">CLEARANCE / MEP COORDINATION</div>
      {decision ? (
        <div className="decision" role="status">
          {decision === "approved"
            ? "✓ Change approved in this preview."
            : "Change rejected. Model unchanged."}
          <button onClick={() => setDecision(null)}>Reset</button>
        </div>
      ) : (
        <div className="approval-actions">
          <button onClick={() => setDecision("rejected")}>Reject</button>
          <button onClick={() => setDecision("approved")}>
            Approve <span>↗</span>
          </button>
        </div>
      )}
    </div>
  );
}
export function PendingPanel() {
  return (
    <div className="pending-panel">
      <div className="preview-dark-title">
        PENDING APPROVALS <span>VIEW ALL ↗</span>
      </div>
      {[
        "REVIEW DOOR WIDTHS",
        "MOVE PLUMBING FIXTURES",
        "UPDATE GUARDRAIL HEIGHT",
      ].map((title, i) => (
        <div key={title}>
          <b>{title}</b>
          <p>
            {
              [
                "Residential tower · Level 02",
                "Community pavilion · Level 01",
                "Riverside offices · Level 03",
              ][i]
            }
          </p>
          <span className="pending-tag">PENDING ↗</span>
        </div>
      ))}
    </div>
  );
}
export function ProductPreview({
  variant = 0,
  hero = false,
}: {
  variant?: number;
  hero?: boolean;
}) {
  return (
    <div
      className={`product-preview preview-${variant} ${hero ? "preview-hero" : ""}`}
    >
      {hero ? (
        <>
          <div className="terrain" aria-hidden="true">
            <Terrain />
          </div>
          <ActivityPanel />
          <PendingPanel />
        </>
      ) : variant === 0 ? (
        <>
          <div className="window-stack" aria-hidden="true">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                style={{ width: `${48 + i * 7}%`, top: `${10 + i * 6}%` }}
              >
                <div className="preview-dark-title">HERON DASHBOARD</div>
              </div>
            ))}
          </div>
          <div className="front-window">
            <ActivityPanel compact />
          </div>
        </>
      ) : variant === 1 ? (
        <>
          <FloorPlan highlight />
          <ApprovalCard />
        </>
      ) : variant === 2 ? (
        <>
          <FloorPlan />
          <div className="history-panel">
            <div className="preview-dark-title">
              PROJECT HISTORY <span>LIVE</span>
            </div>
            {[
              ["10:42", "Door clearance updated", "Approved by Alex"],
              ["10:36", "Corridor width flagged", "IBC 1020.2"],
              ["10:28", "Model check complete", "32 elements reviewed"],
            ].map(([time, title, detail]) => (
              <div key={time}>
                <time>{time}</time>
                <div>
                  <b>{title}</b>
                  <p>{detail}</p>
                </div>
                <span>↗</span>
              </div>
            ))}
          </div>
        </>
      ) : variant === 3 ? (
        <>
          <Elevation />
          <div className="team-panel">
            <div className="preview-dark-title">RESIDENTIAL BUILDING</div>
            <div className="team-project">TEAM ACTIVITY / PROJECT A–01</div>
            {[
              "Alex Morgan",
              "Jamie Miller",
              "Lucy Simmons",
              "Taylor Brooks",
            ].map((name, i) => (
              <div key={name}>
                <span className="avatar">
                  {name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <b>{name}</b>
                <span className={i < 2 ? "pending-tag" : ""}>
                  {i < 2 ? "REVIEWING" : "ACTIVE"}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <FloorPlan />
          <div className="standards-panel">
            <div className="preview-dark-title">ROOM NAMING CONVENTION</div>
            <p>PROJECT STANDARDS / REV. 03</p>
            <div>
              <span>TYPE</span>
              <b>OFFICE</b>
            </div>
            <div>
              <span>DEPARTMENT</span>
              <b>DESIGN STUDIO</b>
            </div>
            <div>
              <span>LEVEL</span>
              <b>02</b>
            </div>
            <div className="standard-saved">
              ✓ Standard applied across your model
            </div>
          </div>
        </>
      )}
    </div>
  );
}
