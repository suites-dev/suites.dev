# Website adoption measurement

Property: **Suites Website**, `449431617`. Measurement ID: `G-G7FJBNFPJJ`.
Analytics loads only for Netlify production builds.

## Adoption events

| Event | Trigger | Interpretation |
| --- | --- | --- |
| `installation_copy` | A successful code-block copy containing a Suites install command | Intent to install Suites |
| `test_example_copy` | A successful code-block copy containing a `TestBed.solitary()` or `TestBed.sociable()` example on a framework guide | Intent to try a framework example |
| `search_result_click` | Selecting a search result | Search helped the reader find a document |
| `quickstart_click` | Selecting a homepage Quick Start link | Intent to start the first-test guide; `cta_location` identifies the header, mobile menu, hero, features, or footer |

Copy events send the page path and, for framework examples, the framework name. They never send copied code. They observe Expressive Code's successful clipboard feedback, so a failed copy does not count. Copies do not prove an installation or a passing test.

Search opens, search results, empty searches, and Quick Start clicks remain diagnostic events. The existing `ads_conversion_PAGE_VIEW_1` measures page views and must not be interpreted as adoption.

## GA property setup

Property settings updated on **19 November 2026**:

1. Removed the key-event flag from `ads_conversion_PAGE_VIEW_1`. The event remains available as an ordinary event. GA warned that unmarking also stops future conversion association in linked accounts, including Google Ads. Historical data remains unchanged.
2. Registered `installation_copy` and `test_example_copy` as code-based key events, counted **Once per session**, with no default monetary value. No page-view-derived event rules were created.
3. Registered event-scoped dimensions: **Framework** for `framework`, **CTA location** for `cta_location`, and **Search term** for `search_term`.
4. Keep `search_result_click` and `quickstart_click` available for diagnostic reporting rather than marking them as adoption key events.
5. Added a 19 November annotation in GA documenting the conversion and engagement baseline change.

Property setup is separate from the website code. The Quick Start click event and CTA changes require this branch to be deployed. Key-event registration and custom dimensions apply to future data, not historical data. The built-in `purchase` key event remains unchanged.

GA counts a session as engaged when it has a key event. Before this correction, every docs page view generated `ads_conversion_PAGE_VIEW_1`, so engagement and conversion rates overstated meaningful activity. Compare engagement against the new baseline from 19 November, rather than interpreting a subsequent fall as a website regression.

## Validate without polluting production data

In a local build with `CONTEXT=production`, block Google tag network requests and stub `window.gtag` to capture calls. Copy a Suites install command and a framework test example. Each successful copy should emit the corresponding event; unrelated code and failed copies should emit neither event. A normal preview build must load no Google tag.

`pnpm test` includes DOM integration tests that execute the installed Expressive Code copy-button script together with the adoption observer. They cover successful install and test-example copies, repeated successful copies, clipboard failure, unrelated snippets, and unrelated feedback. Test events stay in memory and never reach GA.

Run `pnpm test`, `pnpm check`, and `CONTEXT=production pnpm build` for automated checks.

## Compare launch performance

Use the property's **Asia/Jerusalem** timezone and complete days of equal length. Exclude the November 5, 2026 launch day when comparing the launch windows. Filter `hostName` to `suites.dev` to remove local and other-domain traffic. Normalize trailing slashes when grouping page paths.

Report `aocr.org` traffic separately: it recorded zero engagement time in the initial launch comparison and should not be assumed to represent readers. Keep the unfiltered totals available alongside any filtered analysis.

Review users, sessions, docs readership, Google organic sessions, adoption key events, search-result clicks, and 404 page titles. The initial sample is small; changes do not establish that the redesign caused growth.

See Google's documentation for [key-event registration](https://support.google.com/analytics/answer/13128484) and [counting methods](https://support.google.com/analytics/answer/13366706).
