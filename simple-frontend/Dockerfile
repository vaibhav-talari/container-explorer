# Use the official Go image
FROM golang:1.21-alpine

# Install CA certificates for HTTP requests
#RUN apk add --no-cache ca-certificates bash

# Set working directory
WORKDIR /app

# Copy all your Go code and static files
COPY . .

# Expose the port your Go app listens on
EXPOSE 6000

# Run the Go app directly
CMD ["go", "run", "main.go"]
