import { test } from "uvu";
import { equal, throws } from "uvu/assert";
import { evaluateSync } from "@mdx-js/mdx";
import { evaluateSync as xdmEvaluateSync } from "xdm";
import { VFile } from "vfile";
import { createElement } from "react";
import * as runtime from "react/jsx-runtime.js";
import { renderToStaticMarkup } from "react-dom/server.js";
import remarkMdxDisableExplicitJsx from "../index.js";

const h1 = (props) => createElement("h1", { ...props, className: "header" });
const a = (props) => createElement("a", { ...props, className: "link" });

const parseMDX = (mdx, options = {}) =>
  evaluateSync(new VFile(mdx), { ...runtime, ...options }).default;

const parseXDM = (mdx, options = {}) =>
  xdmEvaluateSync(new VFile(mdx), { ...runtime, ...options }).default;

test(`"components" are ingnored without the plugin`, () => {
  const Element = createElement(parseMDX(`# hello \n<h1>hello</h1>`), {
    components: { h1 },
  });

  equal(
    renderToStaticMarkup(Element),
    `<h1 class="header">hello</h1>\n<h1>hello</h1>`
  );
});

test(`MDX "components" are reenabled with the plugin`, () => {
  const Element = createElement(
    parseMDX(`# hello \n<h1>hello</h1>`, {
      remarkPlugins: [remarkMdxDisableExplicitJsx],
    }),
    {
      components: { h1 },
    }
  );

  equal(
    renderToStaticMarkup(Element),
    `<h1 class="header">hello</h1>\n<h1 class="header">hello</h1>`
  );
});

test(`XDM "components" are reenabled with the plugin`, () => {
  const Element = createElement(
    parseXDM(`# hello \n<h1>hello</h1>`, {
      remarkPlugins: [remarkMdxDisableExplicitJsx],
    }),
    {
      components: { h1 },
    }
  );

  equal(
    renderToStaticMarkup(Element),
    `<h1 class="header">hello</h1>\n<h1 class="header">hello</h1>`
  );
});

test(`"whiteList" is working`, () => {
  const Element = createElement(
    parseMDX(`<h1>hello <a href="#">world</a>!</h1>`, {
      remarkPlugins: [[remarkMdxDisableExplicitJsx, { whiteList: ["a"] }]],
    }),
    {
      components: { h1, a },
    }
  );

  equal(
    renderToStaticMarkup(Element),
    `<h1>hello <a href="#" class="link">world</a>!</h1>`
  );
});

test(`"blackList" is working`, () => {
  const Element = createElement(
    parseMDX(`<h1>hello <a href="#">world</a>!</h1>`, {
      remarkPlugins: [[remarkMdxDisableExplicitJsx, { blackList: ["a"] }]],
    }),
    {
      components: { h1, a },
    }
  );

  equal(
    renderToStaticMarkup(Element),
    `<h1 class="header">hello <a href="#">world</a>!</h1>`
  );
});

test(`Non-object "options" throws error`, () => {
  throws(
    () =>
      parseMDX(``, {
        remarkPlugins: [[remarkMdxDisableExplicitJsx, `string`]],
      }),
    /Options should be an object/
  );
});

test(`Throws error if both "whiteList" and "blackList" are set`, () => {
  throws(
    () =>
      parseMDX(``, {
        remarkPlugins: [
          [remarkMdxDisableExplicitJsx, { blackList: [], whiteList: [] }],
        ],
      }),
    /"whiteList" and "blackList" can't be used together/
  );
});

test(`Throws an error if "whiteList" in not an array`, () => {
  throws(
    () =>
      parseMDX(``, {
        remarkPlugins: [[remarkMdxDisableExplicitJsx, { whiteList: `string` }]],
      }),
    /"whiteList" value should be an array/
  );
});

test(`Throws an error if "blackList" in not an array`, () => {
  throws(
    () =>
      parseMDX(``, {
        remarkPlugins: [[remarkMdxDisableExplicitJsx, { blackList: `string` }]],
      }),
    /"blackList" value should be an array/
  );
});

test.run();
