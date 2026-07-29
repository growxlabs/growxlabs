FROM golang:1.26-alpine AS build
WORKDIR /src
COPY packages/execution-go /src/packages/execution-go
COPY services/execution-engine /src/services/execution-engine
WORKDIR /src/services/execution-engine
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/execution-engine ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/execution-engine /execution-engine
EXPOSE 8091
ENTRYPOINT ["/execution-engine"]
