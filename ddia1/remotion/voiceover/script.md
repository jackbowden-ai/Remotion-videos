# Voiceover script: Operational vs analytical systems

Voice: British male, warm teacher, precise and clear. Target pace about 2.6 words per second.
Timings are in seconds (frames at 30fps) and match the scene cuts in `OperationalVsAnalytical.tsx`.

| # | Scene | Window | Line |
|---|-------|--------|------|
| 1 | Title | 0.3 to 3.4 (9 to 102) | Operational versus analytical systems. Two very different jobs for data. |
| 2 | OLTP | 3.8 to 9.5 (114 to 285) | Operational systems, or OLTP, power your app: fast reads and writes of a few rows, always holding the latest state. |
| 3 | OLAP | 9.6 to 15.1 (288 to 453) | Analytical systems, or OLAP, help analysts answer questions, scanning millions of rows and keeping history over time. |
| 4 | ETL | 15.5 to 21.3 (465 to 639) | ETL moves the data across: extract, transform, and load it into a warehouse, so analytics never slows the live app. |
| 5 | Comparison | 21.6 to 26.4 (648 to 792) | In short: operational means small, fast and current. Analytical means big scans and long history. |
| 6 | Takeaway | 26.8 to 29.6 (804 to 888) | Keep transactions fast. Run analytics somewhere else. |

## Sound effects

| Frame | Cue |
|-------|-----|
| 105, 280, 455, 640, 795 | Soft whoosh on each scene transition (light sweep) |
| 6, 10 (title) | Two soft pops as the icons appear |
| OLTP, from 125 every ~14 frames | Short quiet beep as each request dot reaches the database |
| OLAP, 302 to 390 | Gentle rising scan tone as the table is scanned |
| OLAP, 340 to 364 | Three soft blips as the bars grow |
| ETL, 475 to 495 | Three pops as Extract, Transform, Load appear |
| ETL, from 500 every ~12 frames | Quiet data-packet beeps along the pipeline |
| Comparison, 652 to 684 | Light ticks as each row slides in |
| 795 | Gentle resolving chime for the takeaway |

## Music

Light, modern, unobtrusive lo-fi or soft electronic bed at about 100 BPM, no vocals, ducked to roughly 15% under the voice, fading out over the last second.
