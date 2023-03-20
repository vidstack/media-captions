import { tokenizeVTTCue, VTTCue } from 'media-captions';

test('text', () => {
  const cue = new VTTCue(0, 100, 'This is some text.');
  const nodes = tokenizeVTTCue(cue);
  expect(nodes).toMatchInlineSnapshot(`
    [
      {
        "data": "This is some text.",
        "type": "text",
      },
    ]
  `);
});

test('tag name', () => {
  const cue = new VTTCue(
    0,
    100,
    [
      '<c></c>',
      '<i></i>',
      '<b></b>',
      '<u></u>',
      '<ruby></ruby>',
      '<rt></rt>',
      '<v></v>',
      '<lang></lang>',
      '<01:10></01:20>',
    ].join(''),
  );
  const nodes = tokenizeVTTCue(cue);
  expect(nodes).toMatchSnapshot();
});

test('color', () => {
  const cue = new VTTCue(
    0,
    100,
    ['white', 'lime', 'cyan', 'red', 'yellow', 'magenta', 'blue', 'black']
      .map((color) => `<c.${color}></c>`)
      .join(''),
  );
  const nodes = tokenizeVTTCue(cue);
  expect(nodes).toMatchSnapshot();
});

test('bg_color', () => {
  const cue = new VTTCue(
    0,
    100,
    ['white', 'lime', 'cyan', 'red', 'yellow', 'magenta', 'blue', 'black']
      .map((color) => `<c.bg_${color}></c>`)
      .join(''),
  );
  const nodes = tokenizeVTTCue(cue);
  expect(nodes).toMatchSnapshot();
});

test('lang', () => {
  const cue = new VTTCue(0, 100, '<lang en-US></lang><lang en   \tUS></lang>');
  const nodes = tokenizeVTTCue(cue);
  expect(nodes).toMatchInlineSnapshot(`
    [
      {
        "children": [],
        "lang": "en-US",
        "tagName": "span",
        "type": "lang",
      },
      {
        "children": [],
        "lang": "en US",
        "tagName": "span",
        "type": "lang",
      },
    ]
  `);
});

test('voice', () => {
  const cue = new VTTCue(0, 100, '<v John></v><v John  \tDoe></v>');
  const nodes = tokenizeVTTCue(cue);
  expect(nodes).toMatchInlineSnapshot(`
    [
      {
        "children": [],
        "tagName": "span",
        "type": "v",
        "voice": "John",
      },
      {
        "children": [],
        "tagName": "span",
        "type": "v",
        "voice": "John Doe",
      },
    ]
  `);
});

test('class', () => {
  const cue = new VTTCue(0, 100, '<c.foo.bar.baz></c><v.foo.bar John Doe></v>');
  const nodes = tokenizeVTTCue(cue);
  expect(nodes).toMatchInlineSnapshot(`
    [
      {
        "children": [],
        "class": "foo bar baz",
        "tagName": "span",
        "type": "c",
      },
      {
        "children": [],
        "class": "foo bar",
        "tagName": "span",
        "type": "v",
        "voice": "John Doe",
      },
    ]
  `);
});

test('bold', () => {
  const cue = new VTTCue(0, 100, 'This is <b>bold</b>, right?');
  const nodes = tokenizeVTTCue(cue);
  expect(nodes).toMatchInlineSnapshot(`
    [
      {
        "data": "This is ",
        "type": "text",
      },
      {
        "children": [
          {
            "data": "bold",
            "type": "text",
          },
        ],
        "tagName": "b",
        "type": "b",
      },
      {
        "data": ", right?",
        "type": "text",
      },
    ]
  `);
});

test('italic', () => {
  const cue = new VTTCue(0, 100, 'This is <i>italic<i/>');
  const nodes = tokenizeVTTCue(cue);
  expect(nodes).toMatchInlineSnapshot(`
    [
      {
        "data": "This is ",
        "type": "text",
      },
      {
        "children": [
          {
            "data": "italic",
            "type": "text",
          },
        ],
        "tagName": "i",
        "type": "i",
      },
    ]
  `);
});

test('ruby', () => {
  const cue = new VTTCue(0, 100, 'This is <ruby><rt>ruby text</rt></ruby>.');
  const nodes = tokenizeVTTCue(cue);
  expect(nodes).toMatchInlineSnapshot(`
    [
      {
        "data": "This is ",
        "type": "text",
      },
      {
        "children": [
          {
            "children": [
              {
                "data": "ruby text",
                "type": "text",
              },
            ],
            "tagName": "rt",
            "type": "rt",
          },
        ],
        "tagName": "ruby",
        "type": "ruby",
      },
      {
        "data": ".",
        "type": "text",
      },
    ]
  `);
});

test('timestamp', () => {
  const cue = new VTTCue(0, 100, 'This is a <01:20>timestamp</01:20>');
  const nodes = tokenizeVTTCue(cue);
  expect(nodes).toMatchInlineSnapshot(`
    [
      {
        "data": "This is a ",
        "type": "text",
      },
      {
        "children": [
          {
            "data": "timestamp",
            "type": "text",
          },
        ],
        "tagName": "span",
        "time": 80,
        "type": "timestamp",
      },
    ]
  `);
});

test('out of range timestamp', () => {
  const cue = new VTTCue(0, 100, '<01:10:00>Timestamp');
  const nodes = tokenizeVTTCue(cue);
  expect(nodes).toMatchInlineSnapshot(`
    [
      {
        "data": "Timestamp",
        "type": "text",
      },
    ]
  `);
});

test('nested tags', () => {
  const cue = new VTTCue(0, 100, 'This is <b>Bold and <i>italic</i></b>, right?');
  const nodes = tokenizeVTTCue(cue);
  expect(nodes).toMatchInlineSnapshot(`
    [
      {
        "data": "This is ",
        "type": "text",
      },
      {
        "children": [
          {
            "data": "Bold and ",
            "type": "text",
          },
          {
            "children": [
              {
                "data": "italic",
                "type": "text",
              },
            ],
            "tagName": "i",
            "type": "i",
          },
        ],
        "tagName": "b",
        "type": "b",
      },
      {
        "data": ", right?",
        "type": "text",
      },
    ]
  `);
});

test('no closing tag', () => {
  const cue = new VTTCue(0, 100, '<b><i>No closing tags');
  const nodes = tokenizeVTTCue(cue);
  expect(nodes).toMatchInlineSnapshot(`
    [
      {
        "children": [
          {
            "children": [
              {
                "data": "No closing tags",
                "type": "text",
              },
            ],
            "tagName": "i",
            "type": "i",
          },
        ],
        "tagName": "b",
        "type": "b",
      },
    ]
  `);
});

test('html entities', () => {
  const cue = new VTTCue(0, 100, '&amp;&lt;&gt;&quot;&#39;&nbsp;&lrm;&rlm;');
  const nodes = tokenizeVTTCue(cue);
  expect(nodes).toMatchInlineSnapshot(`
    [
      {
        "data": "&<>\\"' ‎‏",
        "type": "text",
      },
    ]
  `);
});
