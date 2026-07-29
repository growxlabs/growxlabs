FROM golang:1.26-alpine AS build
WORKDIR /src
COPY packages/execution-go /src/packages/execution-go
COPY services/execution-worker /src/services/execution-worker
WORKDIR /src/services/execution-worker
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/execution-worker ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/execution-worker /execution-worker
EXPOSE 8093
ENTRYPOINT ["/execution-worker"]
