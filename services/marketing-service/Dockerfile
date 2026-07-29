FROM golang:1.26-alpine AS build
WORKDIR /src
COPY packages/execution-go /src/packages/execution-go
COPY packages/phase4-go /src/packages/phase4-go
COPY services/marketing-service /src/services/marketing-service
WORKDIR /src/services/marketing-service
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/marketing-service ./cmd/server
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/marketing-service /marketing-service
EXPOSE 8105
ENTRYPOINT ["/marketing-service"]
