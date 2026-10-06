# PrintLab Roadmap

## Phase 1: Prototype (Current)
- [x] Web interface built in Next.js.
- [x] Deterministic demo data provider.
- [x] Core test execution state machine (simulated).
- [x] Visual image comparison UI.
- [x] Regression detection display.

## Phase 2: Integration with `go-mfp` and Image Evaluator
- [ ] Implement `RealRunnerProvider` in `src/lib/provider.ts`.
- [ ] Connect to OpenPrinting Python image evaluation backend via REST API.
- [ ] Query active `go-mfp` simulators to populate Printer targets.
- [ ] Implement WebSockets for real-time progress bar updates in `TestRun`.

## Phase 3: OpenPrinting CI/CD
- [ ] Deploy PrintLab alongside OpenPrinting GitHub Actions.
- [ ] Automatically trigger test runs on new PRs to `OpenPrinting/cups` and `libcupsfilters`.
- [ ] Post visual regression links as GitHub comments on PRs.
- [ ] Implement authentication for OpenPrinting maintainers to trigger custom manual test batches.
