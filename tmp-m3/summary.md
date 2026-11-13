# Module 3 capture summary

| # | Label | Method | Path | Status | Error code | ms |
|---|---|---|---|---|---|---|
| 1 | health.check | GET | /health | 200 |  | 2651 |
| 2 | auth.missing-token | GET | /subjects | 401 | MISSING_AUTH_TOKEN | 7 |
| 3 | auth.bad-token | GET | /subjects | 401 | INVALID_TOKEN | 6 |
| 4 | academic-years.list | GET | /academic-years | 404 | RESOURCE_NOT_FOUND | 7 |
| 5 | academic-years.create | POST | /academic-years | 404 | RESOURCE_NOT_FOUND | 66 |
| 6 | semesters.list | GET | /semesters | 404 | RESOURCE_NOT_FOUND | 6 |
| 7 | subjects.semester-filter | GET | /subjects?semesterId=00000000-0000-4000-8000-000000000000 | 200 |  | 5120 |
| 8 | subject.create.empty-name | POST | /subjects | 400 | VALIDATION_ERROR | 2238 |
| 9 | subject.create.long-name | POST | /subjects | 400 | VALIDATION_ERROR | 4374 |
| 10 | subject.create.weekly-too-low | POST | /subjects | 400 | VALIDATION_ERROR | 2421 |
| 11 | subject.create.weekly-too-high | POST | /subjects | 400 | VALIDATION_ERROR | 3753 |
| 12 | subject.create.icon-too-long | POST | /subjects | 400 | VALIDATION_ERROR | 2588 |
| 13 | subject.create.reject-academic-year | POST | /subjects | 400 | VALIDATION_ERROR | 3573 |
| 14 | subject.create.reject-class | POST | /subjects | 400 | VALIDATION_ERROR | 2235 |
| 15 | subject.create.reject-archived | POST | /subjects | 400 | VALIDATION_ERROR | 2962 |
| 16 | subject.create.defaults | POST | /subjects | 201 |  | 7726 |
| 17 | subject.get.after-create | GET | /subjects/721d9c39-c8b8-48ed-92e7-218d93401b53 | 200 |  | 6872 |
| 18 | subject.create.duplicate-same-case | POST | /subjects | 409 | SUBJECT_ALREADY_EXISTS | 5479 |
| 19 | subject.create.duplicate-different-case | POST | /subjects | 409 | SUBJECT_ALREADY_EXISTS | 5598 |
| 20 | subject.create.duplicate-trimmed | POST | /subjects | 409 | SUBJECT_ALREADY_EXISTS | 7122 |
| 21 | subject.create.custom | POST | /subjects | 201 |  | 6161 |
| 22 | subjects.list.default | GET | /subjects | 200 |  | 5519 |
| 23 | subjects.list.archived-false | GET | /subjects?archived=false | 200 |  | 7118 |
| 24 | subjects.list.archived-true-empty | GET | /subjects?archived=true | 200 |  | 6626 |
| 25 | subjects.list.archived-all | GET | /subjects?archived=all | 200 |  | 5142 |
| 26 | subjects.list.search-name | GET | /subjects?search=database | NETWORK_ERROR |  | undefined |
| 27 | subjects.list.search-code | GET | /subjects?search=cs-30 | 200 |  | 9900 |
| 28 | subjects.list.search-no-match | GET | /subjects?search=zzz-nope | 200 |  | 5639 |
| 29 | subjects.list.unknown-params-ignored | GET | /subjects?semesterId=abc&page=2&limit=5 | 200 |  | 5597 |
| 30 | subject.update.fields | PATCH | /subjects/721d9c39-c8b8-48ed-92e7-218d93401b53 | 200 |  | 7927 |
| 31 | subject.update.empty-name | PATCH | /subjects/721d9c39-c8b8-48ed-92e7-218d93401b53 | 400 | VALIDATION_ERROR | 3313 |
| 32 | subject.update.unknown-field | PATCH | /subjects/721d9c39-c8b8-48ed-92e7-218d93401b53 | 400 | VALIDATION_ERROR | 2377 |
| 33 | subject.update.rename-to-existing | PATCH | /subjects/721d9c39-c8b8-48ed-92e7-218d93401b53 | 200 |  | 10303 |
| 34 | subject.archive | PATCH | /subjects/721d9c39-c8b8-48ed-92e7-218d93401b53 | 200 |  | 6999 |
| 35 | subjects.list.after-archive-default | GET | /subjects | 200 |  | 4984 |
| 36 | subjects.list.after-archive-true | GET | /subjects?archived=true | 200 |  | 7256 |
| 37 | subjects.list.after-archive-all | GET | /subjects?archived=all | 200 |  | 5599 |
| 38 | subject.get.archived-by-id | GET | /subjects/721d9c39-c8b8-48ed-92e7-218d93401b53 | 200 |  | 5123 |
| 39 | subject.restore | PATCH | /subjects/721d9c39-c8b8-48ed-92e7-218d93401b53 | 200 |  | 6677 |
| 40 | subject.get.malformed-id | GET | /subjects/not-a-uuid | 400 | VALIDATION_ERROR | 2323 |
| 41 | subject.get.unknown-id | GET | /subjects/00000000-0000-4000-8000-000000000000 | 404 | SUBJECT_NOT_FOUND | 4119 |
| 42 | subject.get.other-users-subject | GET | /subjects/721d9c39-c8b8-48ed-92e7-218d93401b53 | 403 | SUBJECT_OWNERSHIP_VIOLATION | 5236 |
| 43 | subject.patch.other-users-subject | PATCH | /subjects/721d9c39-c8b8-48ed-92e7-218d93401b53 | 403 | SUBJECT_OWNERSHIP_VIOLATION | 5080 |
| 44 | subject.delete.other-users-subject | DELETE | /subjects/721d9c39-c8b8-48ed-92e7-218d93401b53 | 403 | SUBJECT_OWNERSHIP_VIOLATION | 5567 |
| 45 | subject.put-not-allowed | PUT | /subjects/721d9c39-c8b8-48ed-92e7-218d93401b53 | 404 | RESOURCE_NOT_FOUND | 3 |
| 46 | subjects.put-collection-not-allowed | PUT | /subjects | 404 | RESOURCE_NOT_FOUND | 2 |
| 47 | chapter.create.invalid-subject-uuid | POST | /chapters | 400 | VALIDATION_ERROR | 2192 |
| 48 | chapter.create.unknown-subject | POST | /chapters | 404 | SUBJECT_NOT_FOUND | 3757 |
| 49 | chapter.create.other-users-subject | POST | /chapters | 403 | SUBJECT_OWNERSHIP_VIOLATION | 5161 |
| 50 | chapter.create.missing-title | POST | /chapters | 400 | VALIDATION_ERROR | 2239 |
| 51 | chapter.create.long-title | POST | /chapters | 400 | VALIDATION_ERROR | 2600 |
| 52 | chapter.create.too-short-estimate | POST | /chapters | 400 | VALIDATION_ERROR | 2243 |
| 53 | chapter.create.zero-order | POST | /chapters | 400 | VALIDATION_ERROR | 2196 |
| 54 | chapter.create.A-first | POST | /chapters | 201 |  | 22179 |
| 55 | chapter.create.B-insert-at-1 | POST | /chapters | 201 |  | 66819 |
| 56 | chapter.create.C-insert-at-2 | POST | /chapters | 201 |  | 86130 |
| 57 | subject.get.tree-after-chapters | GET | /subjects/721d9c39-c8b8-48ed-92e7-218d93401b53 | 200 |  | 22547 |
| 58 | chapter.update.fields | PATCH | /chapters/3d699d7f-3741-45ac-984b-607a589b1305 | 200 |  | 70172 |
| 59 | chapter.update.unknown-field | PATCH | /chapters/3d699d7f-3741-45ac-984b-607a589b1305 | 400 | VALIDATION_ERROR | 9147 |
| 60 | chapter.update.other-user | PATCH | /chapters/3d699d7f-3741-45ac-984b-607a589b1305 | 403 | CHAPTER_OWNERSHIP_VIOLATION | 21878 |
| 61 | chapter.patch.unknown-id | PATCH | /chapters/00000000-0000-4000-8000-000000000000 | 404 | CHAPTER_NOT_FOUND | 16446 |
| 62 | chapter.patch.malformed-id | PATCH | /chapters/abc | 400 | VALIDATION_ERROR | 11517 |
| 63 | chapter.reorder.C-to-1 | PATCH | /chapters/66a6756c-4304-4465-bd29-8ae20777cd41 | 200 |  | 85320 |
| 64 | subject.get.tree-after-reorder | GET | /subjects/721d9c39-c8b8-48ed-92e7-218d93401b53 | 200 |  | 22639 |
| 65 | chapter.reorder.huge-index-clamped | PATCH | /chapters/becc4205-304f-4710-8dc0-54a8c9e1fe3c | 200 |  | 84681 |
| 66 | subject.get.tree-after-clamp | GET | /subjects/721d9c39-c8b8-48ed-92e7-218d93401b53 | 200 |  | 12749 |
| 67 | chapter.reorder.foundations-to-1 | PATCH | /chapters/becc4205-304f-4710-8dc0-54a8c9e1fe3c | 200 |  | 26983 |
| 68 | chapter.reorder.memory-to-2 | PATCH | /chapters/3d699d7f-3741-45ac-984b-607a589b1305 | 200 |  | 24896 |
| 69 | chapter.reorder.file-to-3 | PATCH | /chapters/66a6756c-4304-4465-bd29-8ae20777cd41 | 200 |  | 29784 |
| 70 | topic.create.invalid-chapter-uuid | POST | /chapters/topics | 400 | VALIDATION_ERROR | 3076 |
| 71 | topic.create.unknown-chapter | POST | /chapters/topics | 404 | CHAPTER_NOT_FOUND | 5649 |
| 72 | topic.create.other-users-chapter | POST | /chapters/topics | 403 | CHAPTER_OWNERSHIP_VIOLATION | 9314 |
| 73 | topic.create.reject-is-completed | POST | /chapters/topics | 400 | VALIDATION_ERROR | 3053 |
| 74 | topic.create.bad-difficulty | POST | /chapters/topics | 400 | VALIDATION_ERROR | 5954 |
| 75 | topic.create.t1-position-1 | POST | /chapters/topics | 201 |  | 29432 |
| 76 | topic.create.t2-insert-at-1 | POST | /chapters/topics | 201 |  | 26319 |
| 77 | topic.create.t3-insert-at-2 | POST | /chapters/topics | 201 |  | 23878 |
| 78 | subject.get.tree-after-topics | GET | /subjects/721d9c39-c8b8-48ed-92e7-218d93401b53 | 200 |  | 8200 |
| 79 | topic.update.fields | PATCH | /topics/8d3ae2d8-41cd-4c2d-915a-c018bb5e028f | 200 |  | 20756 |
| 80 | topic.update.unknown-field | PATCH | /topics/8d3ae2d8-41cd-4c2d-915a-c018bb5e028f | 400 | VALIDATION_ERROR | 3528 |
| 81 | topic.update.other-user | PATCH | /topics/8d3ae2d8-41cd-4c2d-915a-c018bb5e028f | 403 | TOPIC_OWNERSHIP_VIOLATION | 7159 |
| 82 | topic.patch.unknown-id | PATCH | /topics/00000000-0000-4000-8000-000000000000 | 404 | TOPIC_NOT_FOUND | 5354 |
| 83 | topic.patch.malformed-id | PATCH | /topics/abc | 400 | VALIDATION_ERROR | 3600 |
| 84 | topic.reorder.t1-to-1 | PATCH | /topics/8d3ae2d8-41cd-4c2d-915a-c018bb5e028f | 200 |  | 18660 |
| 85 | topic.reorder.t2-to-2 | PATCH | /topics/482853d7-e50f-4950-9b70-e99221913671 | 200 |  | 18696 |
| 86 | topic.reorder.t3-to-3 | PATCH | /topics/ee39adb1-487a-4771-aa26-ba5465202701 | 200 |  | 18401 |
| 87 | topic.reorder.t3-to-1 | PATCH | /topics/ee39adb1-487a-4771-aa26-ba5465202701 | 200 |  | 18641 |
| 88 | subject.get.tree-after-topic-reorder | GET | /subjects/721d9c39-c8b8-48ed-92e7-218d93401b53 | 200 |  | 7967 |
| 89 | topic.reorder.t3-back-to-3 | PATCH | /topics/ee39adb1-487a-4771-aa26-ba5465202701 | 200 |  | 15550 |
| 90 | topic.complete.t1 | POST | /topics/8d3ae2d8-41cd-4c2d-915a-c018bb5e028f/complete | 201 |  | 10840 |
| 91 | topic.complete.t1-again-idempotent | POST | /topics/8d3ae2d8-41cd-4c2d-915a-c018bb5e028f/complete | 201 |  | 10999 |
| 92 | subjectProgress.after-topic-complete | GET | /analytics/subject-progress | 200 |  | 4764 |
| 93 | subject.get.progress-after-topic-complete | GET | /subjects/721d9c39-c8b8-48ed-92e7-218d93401b53 | 200 |  | 6283 |
| 94 | topic.uncomplete.t1 | POST | /topics/8d3ae2d8-41cd-4c2d-915a-c018bb5e028f/uncomplete | 201 |  | 10633 |
| 95 | subjectProgress.after-topic-uncomplete | GET | /analytics/subject-progress | 200 |  | 4486 |
| 96 | topic.complete.t1-second | POST | /topics/8d3ae2d8-41cd-4c2d-915a-c018bb5e028f/complete | 201 |  | 11370 |
| 97 | topic.complete.t2 | POST | /topics/482853d7-e50f-4950-9b70-e99221913671/complete | 201 |  | 11662 |
| 98 | subjectProgress.two-topics | GET | /analytics/subject-progress | 200 |  | 5078 |
| 99 | chapter.complete.A | POST | /chapters/becc4205-304f-4710-8dc0-54a8c9e1fe3c/complete | 201 |  | 10528 |
| 100 | subjectProgress.after-chapter-A | GET | /analytics/subject-progress | 200 |  | 4472 |
| 101 | chapter.complete.B | POST | /chapters/3d699d7f-3741-45ac-984b-607a589b1305/complete | 201 |  | 10241 |
| 102 | subjectProgress.after-chapter-B | GET | /analytics/subject-progress | 200 |  | 5207 |
| 103 | chapter.uncomplete.A | POST | /chapters/becc4205-304f-4710-8dc0-54a8c9e1fe3c/uncomplete | 201 |  | 12188 |
| 104 | subjectProgress.after-chapter-A-uncomplete | GET | /analytics/subject-progress | 200 |  | 6091 |
| 105 | chapter.complete.A-again | POST | /chapters/becc4205-304f-4710-8dc0-54a8c9e1fe3c/complete | 201 |  | 14799 |
| 106 | chapter.complete.C | POST | /chapters/66a6756c-4304-4465-bd29-8ae20777cd41/complete | 201 |  | 9999 |
| 107 | subjectProgress.all-chapters-complete | GET | /analytics/subject-progress | 200 |  | 4889 |
| 108 | chapter.complete.other-user | POST | /chapters/becc4205-304f-4710-8dc0-54a8c9e1fe3c/complete | 403 | CHAPTER_OWNERSHIP_VIOLATION | 4444 |
| 109 | chapter.complete.unknown-id | POST | /chapters/00000000-0000-4000-8000-000000000000/complete | 404 | CHAPTER_NOT_FOUND | 3882 |
| 110 | chapter.complete.malformed-id | POST | /chapters/abc/complete | 400 | VALIDATION_ERROR | 2506 |
| 111 | topic.complete.other-user | POST | /topics/8d3ae2d8-41cd-4c2d-915a-c018bb5e028f/complete | 403 | TOPIC_OWNERSHIP_VIOLATION | 5449 |
| 112 | topic.complete.unknown-id | POST | /topics/00000000-0000-4000-8000-000000000000/complete | 404 | TOPIC_NOT_FOUND | 3912 |
| 113 | topic.delete.other-user | DELETE | /topics/ee39adb1-487a-4771-aa26-ba5465202701 | 403 | TOPIC_OWNERSHIP_VIOLATION | 5126 |
| 114 | topic.delete.t3 | DELETE | /topics/ee39adb1-487a-4771-aa26-ba5465202701 | 200 |  | 10673 |
| 115 | topic.delete.t3-again | DELETE | /topics/ee39adb1-487a-4771-aa26-ba5465202701 | 404 | TOPIC_NOT_FOUND | 3761 |
| 116 | subjectProgress.after-topic-delete | GET | /analytics/subject-progress | 200 |  | 4485 |
| 117 | chapter.delete.other-user | DELETE | /chapters/66a6756c-4304-4465-bd29-8ae20777cd41 | 403 | CHAPTER_OWNERSHIP_VIOLATION | 4837 |
| 118 | chapter.delete.C-with-topics | DELETE | /chapters/66a6756c-4304-4465-bd29-8ae20777cd41 | 200 |  | 10597 |
| 119 | chapter.delete.C-again | DELETE | /chapters/66a6756c-4304-4465-bd29-8ae20777cd41 | 404 | CHAPTER_NOT_FOUND | 3880 |
| 120 | subjectProgress.after-chapter-delete | GET | /analytics/subject-progress | 200 |  | 4476 |
| 121 | subject.get.after-chapter-delete | GET | /subjects/721d9c39-c8b8-48ed-92e7-218d93401b53 | 200 |  | 5923 |
| 122 | ratelimit.health.101 | GET | /health | 429 | RATE_LIMIT_EXCEEDED | 78 |
| 123 | ratelimit.health.102 | GET | /health | 429 | RATE_LIMIT_EXCEEDED | 79 |
| 124 | ratelimit.health.103 | GET | /health | 429 | RATE_LIMIT_EXCEEDED | 79 |
| 125 | ratelimit.health.104 | GET | /health | 429 | RATE_LIMIT_EXCEEDED | 79 |
| 126 | ratelimit.health.105 | GET | /health | 429 | RATE_LIMIT_EXCEEDED | 78 |
| 127 | ratelimit.health.2 | GET | /health | 200 |  | 1854 |
| 128 | ratelimit.health.1 | GET | /health | 200 |  | 1886 |
| 129 | ratelimit.health.9 | GET | /health | 200 |  | 3396 |
| 130 | ratelimit.health.10 | GET | /health | 200 |  | 3476 |
| 131 | ratelimit.health.11 | GET | /health | 200 |  | 4955 |
| 132 | ratelimit.health.12 | GET | /health | 200 |  | 5039 |
| 133 | ratelimit.health.6 | GET | /health | 200 |  | 5358 |
| 134 | ratelimit.health.7 | GET | /health | 200 |  | 5358 |
| 135 | ratelimit.health.3 | GET | /health | 200 |  | 5361 |
| 136 | ratelimit.health.4 | GET | /health | 200 |  | 5361 |
| 137 | ratelimit.health.5 | GET | /health | 200 |  | 5437 |
| 138 | ratelimit.health.8 | GET | /health | 200 |  | 5437 |
| 139 | ratelimit.health.13 | GET | /health | 200 |  | 6526 |
| 140 | ratelimit.health.14 | GET | /health | 200 |  | 6620 |
| 141 | ratelimit.health.15 | GET | /health | 200 |  | 7356 |
| 142 | ratelimit.health.17 | GET | /health | 200 |  | 7393 |
| 143 | ratelimit.health.16 | GET | /health | 200 |  | 7434 |
| 144 | ratelimit.health.18 | GET | /health | 200 |  | 7522 |
| 145 | ratelimit.health.19 | GET | /health | 200 |  | 7561 |
| 146 | ratelimit.health.20 | GET | /health | 200 |  | 7593 |
| 147 | ratelimit.health.21 | GET | /health | 200 |  | 8057 |
| 148 | ratelimit.health.22 | GET | /health | 200 |  | 8175 |
| 149 | ratelimit.health.23 | GET | /health | 200 |  | 9375 |
| 150 | ratelimit.health.24 | GET | /health | 200 |  | 9514 |
| 151 | ratelimit.health.27 | GET | /health | 200 |  | 9521 |
| 152 | ratelimit.health.25 | GET | /health | 200 |  | 9641 |
| 153 | ratelimit.health.29 | GET | /health | 200 |  | 9643 |
| 154 | ratelimit.health.28 | GET | /health | 200 |  | 9670 |
| 155 | ratelimit.health.31 | GET | /health | 200 |  | 9749 |
| 156 | ratelimit.health.26 | GET | /health | 200 |  | 9773 |
| 157 | ratelimit.health.35 | GET | /health | 200 |  | 11189 |
| 158 | ratelimit.health.37 | GET | /health | 200 |  | 11308 |
| 159 | ratelimit.health.30 | GET | /health | 200 |  | 11472 |
| 160 | ratelimit.health.33 | GET | /health | 200 |  | 11646 |
| 161 | ratelimit.health.32 | GET | /health | 200 |  | 11647 |
| 162 | ratelimit.health.34 | GET | /health | 200 |  | 11759 |
| 163 | ratelimit.health.36 | GET | /health | 200 |  | 11829 |
| 164 | ratelimit.health.38 | GET | /health | 200 |  | 11950 |
| 165 | ratelimit.health.39 | GET | /health | 200 |  | 12758 |
| 166 | ratelimit.health.40 | GET | /health | 200 |  | 12917 |
| 167 | ratelimit.health.42 | GET | /health | 200 |  | 13571 |
| 168 | ratelimit.health.43 | GET | /health | 200 |  | 13709 |
| 169 | ratelimit.health.41 | GET | /health | 200 |  | 13750 |
| 170 | ratelimit.health.44 | GET | /health | 200 |  | 13831 |
| 171 | ratelimit.health.45 | GET | /health | 200 |  | 13996 |
| 172 | ratelimit.health.46 | GET | /health | 200 |  | 14147 |
| 173 | ratelimit.health.47 | GET | /health | 200 |  | 14306 |
| 174 | ratelimit.health.48 | GET | /health | 200 |  | 14465 |
| 175 | ratelimit.health.49 | GET | /health | 200 |  | 16026 |
| 176 | ratelimit.health.51 | GET | /health | 200 |  | 16030 |
| 177 | ratelimit.health.50 | GET | /health | 200 |  | 16031 |
| 178 | ratelimit.health.52 | GET | /health | 200 |  | 16030 |
| 179 | ratelimit.health.55 | GET | /health | 200 |  | 16141 |
| 180 | ratelimit.health.56 | GET | /health | 200 |  | 16307 |
| 181 | ratelimit.health.53 | GET | /health | 200 |  | 16471 |
| 182 | ratelimit.health.54 | GET | /health | 200 |  | 16475 |
| 183 | ratelimit.health.57 | GET | /health | 200 |  | 18226 |
| 184 | ratelimit.health.59 | GET | /health | 200 |  | 18228 |
| 185 | ratelimit.health.60 | GET | /health | 200 |  | 18230 |
| 186 | ratelimit.health.58 | GET | /health | 200 |  | 18231 |
| 187 | ratelimit.health.61 | GET | /health | 200 |  | 18346 |
| 188 | ratelimit.health.62 | GET | /health | 200 |  | 18346 |
| 189 | ratelimit.health.64 | GET | /health | 200 |  | 18665 |
| 190 | ratelimit.health.63 | GET | /health | 200 |  | 18668 |
| 191 | ratelimit.health.69 | GET | /health | 200 |  | 19942 |
| 192 | ratelimit.health.70 | GET | /health | 200 |  | 19943 |
| 193 | ratelimit.health.77 | GET | /health | 503 |  | 20080 |
| 194 | ratelimit.health.79 | GET | /health | 503 |  | 20083 |
| 195 | ratelimit.health.75 | GET | /health | 503 |  | 20087 |
| 196 | ratelimit.health.76 | GET | /health | 503 |  | 20091 |
| 197 | ratelimit.health.81 | GET | /health | 503 |  | 20093 |
| 198 | ratelimit.health.83 | GET | /health | 503 |  | 20095 |
| 199 | ratelimit.health.84 | GET | /health | 503 |  | 20098 |
| 200 | ratelimit.health.82 | GET | /health | 503 |  | 20103 |
| 201 | ratelimit.health.78 | GET | /health | 503 |  | 20106 |
| 202 | ratelimit.health.80 | GET | /health | 503 |  | 20108 |
| 203 | ratelimit.health.85 | GET | /health | 503 |  | 20111 |
| 204 | ratelimit.health.90 | GET | /health | 503 |  | 20112 |
| 205 | ratelimit.health.91 | GET | /health | 503 |  | 20115 |
| 206 | ratelimit.health.93 | GET | /health | 503 |  | 20117 |
| 207 | ratelimit.health.92 | GET | /health | 503 |  | 20121 |
| 208 | ratelimit.health.86 | GET | /health | 503 |  | 20124 |
| 209 | ratelimit.health.96 | GET | /health | 503 |  | 20125 |
| 210 | ratelimit.health.97 | GET | /health | 503 |  | 20126 |
| 211 | ratelimit.health.87 | GET | /health | 503 |  | 20130 |
| 212 | ratelimit.health.94 | GET | /health | 503 |  | 20129 |
| 213 | ratelimit.health.99 | GET | /health | 503 |  | 20131 |
| 214 | ratelimit.health.100 | GET | /health | 503 |  | 20132 |
| 215 | ratelimit.health.98 | GET | /health | 503 |  | 20135 |
| 216 | ratelimit.health.95 | GET | /health | 503 |  | 20136 |
| 217 | ratelimit.health.88 | GET | /health | 503 |  | 20139 |
| 218 | ratelimit.health.89 | GET | /health | 503 |  | 20141 |
| 219 | ratelimit.health.65 | GET | /health | 200 |  | 20743 |
| 220 | ratelimit.health.66 | GET | /health | 200 |  | 20747 |
| 221 | ratelimit.health.68 | GET | /health | 200 |  | 20784 |
| 222 | ratelimit.health.67 | GET | /health | 200 |  | 20785 |
| 223 | ratelimit.health.72 | GET | /health | 200 |  | 21263 |
| 224 | ratelimit.health.71 | GET | /health | 200 |  | 21265 |
| 225 | ratelimit.health.74 | GET | /health | 200 |  | 21623 |
| 226 | ratelimit.health.73 | GET | /health | 200 |  | 21625 |
| 227 | ratelimit.subjects-still-ok | GET | /subjects | 200 |  | 5795 |
| 228 | subject.delete.s2 | DELETE | /subjects/02c10394-d6b3-4018-a320-43a78e0bd061 | 200 |  | 7103 |
| 229 | subject.delete.s1-cascade | DELETE | /subjects/721d9c39-c8b8-48ed-92e7-218d93401b53 | 200 |  | 7621 |
| 230 | subject.get.after-delete | GET | /subjects/721d9c39-c8b8-48ed-92e7-218d93401b53 | 404 | SUBJECT_NOT_FOUND | 3877 |
| 231 | subjects.list.after-delete | GET | /subjects | 200 |  | 4036 |