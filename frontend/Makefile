.PHONY: help install dev build preview clean lint docker-build docker-run

help:
	@echo "STEM Commons - Frontend Commands"
	@echo "================================"
	@echo "make install       - Install dependencies"
	@echo "make dev          - Start development server"
	@echo "make build        - Build for production"
	@echo "make preview      - Preview production build"
	@echo "make clean        - Clean build artifacts"
	@echo "make lint         - Run ESLint"
	@echo "make docker-build - Build Docker image"
	@echo "make docker-run   - Run Docker container"

install:
	npm install

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

clean:
	rm -rf dist node_modules .next *.tsbuildinfo

lint:
	npx eslint src --ext .ts,.tsx

docker-build:
	docker build -f Dockerfile.dev -t stem-commons-web:dev .
	docker build -f Dockerfile -t stem-commons-web:prod .

docker-run-dev:
	docker run -p 5173:5173 -v $(PWD)/src:/app/src stem-commons-web:dev

docker-run-prod:
	docker run -p 3000:3000 stem-commons-web:prod
