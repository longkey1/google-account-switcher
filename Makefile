.PHONY: release

# Get current version from git tag
VERSION := $(shell v=$$(git tag --sort=-v:refname | head -n1 2>/dev/null); [ -n "$$v" ] && echo "$$v" || echo "v0.0.0")
MAJOR := $(shell echo $(VERSION) | cut -d. -f1 | tr -d 'v')
MINOR := $(shell echo $(VERSION) | cut -d. -f2)
PATCH := $(shell echo $(VERSION) | cut -d. -f3)

# Variables for release target
dryrun ?= true
type ?=

release: ## Release target with type argument. Usage: make release type=patch|minor|major dryrun=false
	@if [ "$(type)" = "" ]; then \
		echo "Usage: make release type=<type> [dryrun=false]"; \
		echo ""; \
		echo "Types:"; \
		echo "  patch  - Increment patch version (e.g., v1.2.3 -> v1.2.4)"; \
		echo "  minor  - Increment minor version (e.g., v1.2.3 -> v1.3.0)"; \
		echo "  major  - Increment major version (e.g., v1.2.3 -> v2.0.0)"; \
		echo ""; \
		echo "Options:"; \
		echo "  dryrun - Set to false to actually create and push the tag (default: true)"; \
		echo ""; \
		echo "Current version: $(VERSION)"; \
		exit 0; \
	elif [ "$(type)" = "patch" ] || [ "$(type)" = "minor" ] || [ "$(type)" = "major" ]; then \
		NEXT_VERSION=$$(if [ "$(type)" = "patch" ]; then \
			echo "v$(MAJOR).$(MINOR).$$(expr $(PATCH) + 1)"; \
		elif [ "$(type)" = "minor" ]; then \
			echo "v$(MAJOR).$$(expr $(MINOR) + 1).0"; \
		elif [ "$(type)" = "major" ]; then \
			echo "v$$(expr $(MAJOR) + 1).0.0"; \
		fi); \
		echo "Current version: $(VERSION)"; \
		echo "Next version: $$NEXT_VERSION"; \
		if [ "$(dryrun)" = "false" ]; then \
			echo "Updating manifest.json version to $${NEXT_VERSION#v}..."; \
			sed -i "s/\"version\": \".*\"/\"version\": \"$${NEXT_VERSION#v}\"/" manifest.json; \
			git add manifest.json; \
			git commit -m "chore: bump version to $$NEXT_VERSION"; \
			echo "Creating new tag $$NEXT_VERSION..."; \
			git push origin master --no-verify --force-with-lease; \
			git tag -a $$NEXT_VERSION -m "Release of $$NEXT_VERSION"; \
			git push origin $$NEXT_VERSION --no-verify --force-with-lease; \
			echo "Tag $$NEXT_VERSION has been created and pushed"; \
			echo "GitHub Actions will build the release binary automatically"; \
		else \
			echo "[DRY RUN] Showing what would be done..."; \
			echo "Would update manifest.json version to $${NEXT_VERSION#v}"; \
			echo "Would commit version bump"; \
			echo "Would push to origin/master"; \
			echo "Would create tag: $$NEXT_VERSION"; \
			echo "Would push tag to origin: $$NEXT_VERSION"; \
			echo ""; \
			echo "To execute this release, run:"; \
			echo "  make release type=$(type) dryrun=false"; \
			echo "Dry run complete."; \
		fi \
	else \
		echo "Error: Invalid release type. Use 'patch', 'minor', or 'major'"; \
		exit 1; \
	fi

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
