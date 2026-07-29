FROM golang:1.26-alpine AS build
WORKDIR /src
COPY packages/execution-go /src/packages/execution-go
COPY packages/phase4-go /src/packages/phase4-go
COPY services/capability-service /src/services/capability-service
WORKDIR /src/services/capability-service
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/capability-service ./cmd/server
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/capability-service /capability-service
EXPOSE 8095
ENTRYPOINT ["/capability-service"]
