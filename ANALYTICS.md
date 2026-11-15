# Website adoption measurement

Property: **Suites Website**, `449431617`. Measurement ID: `G-G7FJBNFPJJ`.
Analytics loads only for Netlify production builds.

## Adoption events

| Event | Trigger | Interpretation |
| --- | --- | --- |
| `installation_copy` | A successful code-block copy containing a Suites install command | Intent to install Suites |
| `test_example_copy` | A successful code-block copy containing a `TestBed.solitary()` or `TestBed.sociable()` example on a framework guide | Intent to try a framework example |
| `search_result_click` | Selecting a search result | Search helped the reader find a document |

Copy events send the page path and, for framework examples, the framework name. They never send copied code. They observe Expressive Code's successful clipboard feedback, so a failed copy does not count. Copies do not prove an installation or a passing test.

Search opens, search results, and empty searches remain diagnostic events. The existing `ads_conversion_PAGE_VIEW_1` measures page-view conversions and must not be interpreted as adoption.

## GA property setup

After reviewing and deploying the branch:

1. In **Admin > Data display > Events**, create or mark `installation_copy` and `test_example_copy` as key events. Use **Once per session** for each. GA allows registering event names before their first occurrence.
2. Under **Custom definitions**, create an event-scoped dimension named **Framework**, with event parameter `framework`.
3. Keep `search_result_click` available for search reporting. Do not treat search activity alone as installation intent.

Property setup is separate from the website code. Check the GA interface for the registered definitions before treating setup as complete. Key-event registration applies to future events, not historical data.

## Validate without polluting production data

In a local build with `CONTEXT=production`, block Google tag network requests and stub `window.gtag` to capture calls. Copy a Suites install command and a framework test example. Each successful copy should emit the corresponding event; unrelated code and failed copies should emit neither event. A normal preview build must load no Google tag.

Run `pnpm test`, `pnpm check`, and `CONTEXT=production pnpm build` for automated checks.

## Compare launch performance

Use the property's **Asia/Jerusalem** timezone and complete days of equal length. Exclude the November 5, 2026 launch day when comparing the launch windows. Filter `hostName` to `suites.dev` to remove local and other-domain traffic. Normalize trailing slashes when grouping page paths.

Report `aocr.org` traffic separately: it recorded zero engagement time in the initial launch comparison and should not be assumed to represent readers. Keep the unfiltered totals available alongside any filtered analysis.

Review users, sessions, docs readership, Google organic sessions, adoption key events, search-result clicks, and 404 page titles. The initial sample is small; changes do not establish that the redesign caused growth.

See Google's documentation for [key-event registration](https://support.google.com/analytics/answer/13128484) and [counting methods](https://support.google.com/analytics/answer/13366706).
