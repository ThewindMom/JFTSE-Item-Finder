TSC = tsc
TSC_FLAGS = --pretty -p
BROWSERIFY = NODE_PATH=. node_modules/.bin/browserify -p esmify
MINIFY = node_modules/uglify-js/bin/uglifyjs
RM = rm -f
CP = cp
TYPESCRIPT_SOURCES = $(filter-out %.test.ts,$(wildcard *.ts))

.NOTPARALLEL:

all: release debug

catalog:
	bun run generate:catalog

release: browserified.js
	$(MINIFY) $< -cm > script.js

debug: compile
	$(BROWSERIFY) -d main.js > debug/script.js
	$(CP) index.html debug/index.html
	$(CP) style.css debug/style.css
	$(CP) $(TYPESCRIPT_SOURCES) debug
	$(CP)  favicon.ico debug/favicon.ico

browserified.js: compile
	$(BROWSERIFY) main.js > $@

compile:
	$(TSC) $(TSC_FLAGS) tsconfig.build.json

.PHONY: all catalog compile release debug clean
clean:
	$(RM) *.js *.map
