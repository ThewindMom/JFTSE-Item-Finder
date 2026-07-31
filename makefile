TSC = tsc
TSC_FLAGS = --pretty -p
BROWSERIFY = NODE_PATH=. node_modules/.bin/browserify -p esmify
MINIFY = node_modules/uglify-js/bin/uglifyjs
RM = rm -f
CP = cp
TYPESCRIPT_SOURCES = $(filter-out %.test.ts,$(wildcard *.ts))

all: release debug

release: browserified.js
	$(MINIFY) $< -cm > script.js

debug: main.js
	$(BROWSERIFY) -d $< > debug/script.js
	$(CP) index.html debug/index.html
	$(CP) style.css debug/style.css
	$(CP) style.css debug/style.css
	$(CP) $(TYPESCRIPT_SOURCES) debug
	$(CP)  favicon.ico debug/favicon.ico

browserified.js: main.js
	$(BROWSERIFY) $< > $@

$(patsubst %.ts,%.js,$(TYPESCRIPT_SOURCES)) &: $(TYPESCRIPT_SOURCES) tsconfig.json makefile
	$(TSC) $(TSC_FLAGS) .

.PHONY: clean
clean:
	$(RM) *.js *.map
