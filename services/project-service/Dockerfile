FROM golang:1.26-alpine AS build
WORKDIR /src
COPY packages/execution-go /src/packages/execution-go
COPY packages/phase4-go /src/packages/phase4-go
COPY services/project-service /src/services/project-service
WORKDIR /src/services/project-service
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/project-service ./cmd/server
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/project-service /project-service
EXPOSE 8104
ENTRYPOINT ["/project-service"]
