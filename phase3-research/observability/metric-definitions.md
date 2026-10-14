# Observability Metric Definitions: Mathematical Semantics, Formulas & Invariants

**Document Version:** 1.0.0  
**Researcher:** Senior Observability UX Designer, Telemetry Standards Specialist  
**Standards Consulted:** OpenTelemetry Metrics Data Model, Prometheus Histogram Quantile Specifications, Google SRE Book & Workbook (SLOs and Error Budgets)  
**Location:** [`phase3-research/observability/metric-definitions.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/observability/metric-definitions.md)  

---

## 1. Executive Rules for Implementation

To prevent frontend agent **GPT Astra** from inventing mathematically inconsistent metrics or meaningless mock averages, this specification provides strict formulas, units, aggregation rules, and worked examples.

> [!CAUTION]
> **Three Forbidden Telemetry Fallacies**:
> 1. **Never average percentiles**: Averaging a series of p95 latency values does **not** yield an overall p95! Percentiles are non-linear order statistics.
> 2. **Never average percentages directly**: Averaging error rates across intervals with different request volumes creates severe mathematical skew. Ratios must be computed from weighted event sums: `Σ(errors) / Σ(requests)`.
> 3. **Never equate HTTP success with uptime**: An application returning HTTP 200 responses to 99% of requests while 1% fail is exhibiting a **99% Request-Based Success SLI**, not "99% server probe uptime".

---

## 2. Metric Specifications

### 2.1 Request Throughput (`request_rate`)

* **Semantic Meaning**: The instantaneous rate of incoming requests handled by the service or application.
* **Standard Unit**: `requests / second` (`req/s`).
* **Mathematical Definition**:
  $$\text{Throughput} = \frac{\Delta \text{RequestCount}}{\Delta t}$$
  Where $\Delta \text{RequestCount}$ is the raw count of requests received in bucket interval $\Delta t$ (in seconds).
* **Numerator & Denominator**:
  - Numerator: Integer count of completed HTTP/gRPC requests within the time window.
  - Denominator: Duration of the time bucket in seconds (e.g. 900s for a 15-minute bucket).
* **Appropriate Chart Type**: Line chart with smooth linear interpolation, or stacked bar chart for multi-service throughput.
* **Aggregation Across Intervals**:
  - Average Throughput across an entire range: $\frac{\sum \Delta \text{Count}}{\sum \Delta t}$.
  - Peak Throughput: $\max(\text{bucket\_rates})$.
* **Tooltip Format**: `1,280 req/s` (formatted with thousands separators).
* **Comparison Calculation**:
  $$\text{Delta} = \frac{\text{CurrentRate} - \text{BaselineRate}}{\text{BaselineRate}} \times 100\%$$
* **Synthetic Data Acceptance Check**:
  - For a 15-minute bucket ($\Delta t = 900\text{s}$) with 1,152,000 requests:
    $$\text{Rate} = \frac{1,152,000}{900} = 1,280.0\text{ req/s}$$

---

### 2.2 Error Rate (`error_rate`)

* **Semantic Meaning**: The proportion of all valid requests that failed due to server-side errors (HTTP 5xx, unhandled exceptions, downstream RPC timeouts).
* **Standard Unit**: Percentage (`%`).
* **Mathematical Definition**:
  $$\text{ErrorRate} = \frac{\sum \text{FailedRequests}}{\sum \text{TotalEligibleRequests}} \times 100\%$$
* **Eligibility Rules**:
  - Numerator: HTTP status codes `500..599` + synthetic timeout failures.
  - Denominator: All requests (`2xx + 3xx + 4xx + 5xx`).
  - *Note on 4xx*: Client errors (`4xx`) are tracked separately in the HTTP status breakdown and are excluded from the server error rate numerator to prevent external client misconfiguration from triggering server alerts.
* **Aggregation Invariant (Crucial)**:
  - If Interval A has 1,000 requests and 10 errors (1.0%), and Interval B has 10,000 requests and 500 errors (5.0%):
    - **Incorrect (Naive Average)**: $\frac{1.0\% + 5.0\%}{2} = 3.0\%$
    - **Correct (Weighted Sum)**: $\frac{10 + 500}{1,000 + 10,000} \times 100\% = \frac{510}{11,000} = 4.64\%$
* **Appropriate Chart Type**: Line chart with alert threshold rule (e.g. red dashed reference line at 1.0%).
* **Tooltip Format**: `3.42 %` (`48 failed / 1,403 total`).

---

### 2.3 Request Latency Percentiles (`latency_p50`, `latency_p95`, `latency_p99`)

* **Semantic Meaning**: The duration required to process a request from receipt to response completion, measured at specific quantiles of the response time distribution:
  - **p50 (Median)**: 50% of requests experienced latency less than or equal to this value (typical user experience).
  - **p95 (95th Percentile)**: 95% of requests completed faster than this threshold; reflects tail degradation.
  - **p99 (99th Percentile)**: 99% of requests completed faster; reflects extreme edge latency.
* **Standard Unit**: Milliseconds (`ms`).
* **Why Percentiles Cannot Be Averaged**:
  - A percentile is an order statistic rank, not an additive quantity. If p95 is 100ms in morning hours (low volume) and 1,000ms in afternoon hours (high volume), the true 24-hour p95 is determined by the combined histogram of all response times, **not** the arithmetic mean of 100 and 1,000 (550ms).
  - In synthetic generation, Astra must compute the summary range percentile using the underlying pre-computed bucket distributions or explicit scenario constants.
* **Appropriate Chart Type**: Multi-line time-series with distinct line styles:
  - `p50`: Hairline gray `#8a8a84` (`stroke-width: 1px`).
  - `p95`: Solid charcoal `#282828` (`stroke-width: 2px`).
  - `p99`: Ochre/Alert dashed line `#fa3600` (`stroke-width: 1.5px`, `stroke-dasharray: 2 2`).
* **Tooltip Format**:
  ```
  LATENCY DISTRIBUTION (09:24 UTC)
  p50 (Median):   48 ms
  p95 (Tail):    482 ms [SPIKE]
  p99 (Extreme): 1,120 ms [BREACH]
  ```

---

### 2.4 Service Level Indicator (SLI) & Error Budget

* **Semantic Meaning**: The measure of compliant performance against an agreed reliability objective over a rolling compliance window (Google SRE standard).
* **SLI Definition (Request-Based Success Ratio)**:
  $$\text{SLI} = \frac{\text{Good Requests}}{\text{Total Valid Requests}} \times 100\%$$
  Where a "Good Request" satisfies both:
  1. HTTP response code is not in `5xx`.
  2. Total roundtrip latency is $\le 500\text{ms}$.
* **Service Level Objective (SLO)**: `99.90%` over a rolling 30-day window.
* **Error Budget Definition**:
  $$\text{Total Error Budget} = 100\% - \text{SLO} = 0.10\% = 0.0010$$
* **Remaining Error Budget**:
  $$\text{Remaining Budget} = \frac{\text{Allowed Failed Requests} - \text{Actual Failed Requests}}{\text{Allowed Failed Requests}} \times 100\%$$
* **Burn Rate Semantics**:
  - The rate at which the error budget is being consumed relative to normal linear consumption.
  $$\text{Burn Rate} = \frac{\text{Observed Error Rate}}{\text{Allowed Error Rate}}$$
  - At an SLO of 99.9%, the allowed error rate is $0.10\%$.
  - If current error rate is $1.44\%$:
    $$\text{Burn Rate} = \frac{1.44\%}{0.10\%} = 14.4$$
  - A burn rate of $14.4$ consumes **2% of the entire 30-day budget in just 1 hour** (the standard Google SRE multi-burn-rate paging condition!).
* **Tooltip Format**: `SLI: 99.18% | Budget Remaining: 42.1% | Burn Rate: 14.4x`.

---

### 2.5 Composite Project & Service Health

* **Health Enum Values**:
  1. `healthy`: All SLIs within normal bounds; error rate < 0.5%; p95 latency < 150ms; 0 active incidents.
  2. `degraded`: One or more services breach warning thresholds (e.g. error rate 1.0–5.0%, p95 latency 200–800ms) or 1 active P2/P3 incident exists.
  3. `critical`: Immediate user-facing impairment; error rate > 5.0%; p95 latency > 800ms; or active P1 incident.
  4. `unknown`: Collector disconnected, telemetry pending, or local project without monitoring.
* **Project Health Aggregation Hierarchy (Worst-Of Rule)**:
  $$\text{ProjectHealth} = \begin{cases} 
  \text{critical} & \text{if any service is critical OR activeIncidentCount } \ge 1 \text{ [P1]} \\
  \text{degraded} & \text{else if any service is degraded OR activeIncidentCount } \ge 1 \text{ [P2]} \\
  \text{unknown}  & \text{else if monitoringStatus} \in \{\text{"disconnected"}, \text{"pending"}\} \\
  \text{healthy}  & \text{otherwise}
  \end{cases}$$

---

### 2.6 Incident Quantities

* **Attributes**:
  - `id`: Unique identifier (e.g. `INC-2026-1014-01`).
  - `severity`: `P1` (Critical / Customer Impacting), `P2` (Degraded / High Risk), `P3` (Moderate / Elevated Tail), `P4` (Low / Informational).
  - `status`: `active` | `investigating` | `mitigated` | `resolved`.
  - `startedAt`: ISO 8601 string (`2026-10-14T09:26:00Z`).
  - `resolvedAt`: ISO 8601 string or `null` if active.
  - `duration`: Calculated elapsed duration in minutes (e.g. `4m active` as of `09:30 UTC`).
  - `affectedServices`: Array of service IDs (e.g. `["payment-gateway-svc-2"]`).
  - `triggeringCondition`: Explicit alert rule threshold (e.g. `settlement_queue_depth > 1000 for 5m`).

---

## 3. Worked Acceptance Verification Table

Astra must verify synthetic fixture values against this table:

| Scenario / Window | Metric | Numerator | Denominator | Calculated Result | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Normal Baseline** (08:00–09:00 UTC) | Throughput | 4,320,000 reqs | 3,600 s | **1,200.0 req/s** | PASS |
| **Normal Baseline** (08:00–09:00 UTC) | Error Rate | 4,320 errors | 4,320,000 reqs | **0.10 %** | PASS |
| **Normal Baseline** (08:00–09:00 UTC) | Latency p95 | N/A (Quantile) | N/A | **82 ms** | PASS |
| **Degraded Spike** (09:15–09:30 UTC) | Throughput | 1,152,000 reqs | 900 s | **1,280.0 req/s** | PASS |
| **Degraded Spike** (09:15–09:30 UTC) | Error Rate | 39,400 errors | 1,152,000 reqs | **3.42 %** | PASS (Elevated) |
| **Degraded Spike** (09:15–09:30 UTC) | Latency p95 | N/A (Quantile) | N/A | **482 ms** | PASS (Spike) |
| **Degraded Spike** (09:15–09:30 UTC) | Latency p99 | N/A (Quantile) | N/A | **1,120 ms** | PASS (Extreme) |
| **Incident Trigger** (@ 09:26 UTC) | Queue Depth | 1,420 msgs | Threshold: 1,000 | **Breached** | PASS (Incident P1) |
| **SLO Compliance** (Current 24h) | SLI | 27,840,000 good | 28,070,000 total | **99.18 %** | PASS (Degraded) |
