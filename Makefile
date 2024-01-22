develop:
	npx webpack serve

publish:
	npm publish --dry-run

install:
	npm link
	npm ci

build:
	rm -rf dist
	NODE_ENV=production npx webpack

lint:
	npx eslint .

lint-fix:
	npx eslint . --fix