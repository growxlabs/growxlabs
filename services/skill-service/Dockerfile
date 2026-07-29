FROM golang:1.26-alpine AS build
WORKDIR /src
COPY packages/execution-go /src/packages/execution-go
COPY packages/phase4-go /src/packages/phase4-go
COPY services/skill-service /src/services/skill-service
WORKDIR /src/services/skill-service
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/skill-service ./cmd/server
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/skill-service /skill-service
EXPOSE 8096
ENTRYPOINT ["/skill-service"]
