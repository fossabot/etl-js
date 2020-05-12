import { assert } from "chai";
import Engine from "../../lib/templating/engine";

describe("engine", function () {
  beforeEach(function (done: () => void) {
    done();
  });

  afterEach(function (done: () => void) {
    done();
  });

  it("evaluateObjectNoVars", function () {
    var oObj = {
      abc: {
        toto_titi: {
          a: "1",
          b: 2,
        },
      },
    };
    var oTested = new Engine();
    var oContext = {
      year: 2018,
    };
    var oActual = {};
    oTested.evaluateObject(oObj, oContext, oActual);
    assert.deepEqual(oActual, { abc: { toto_titi: { a: "1", b: 2 } } });
  });

  it("evaluateObjectBasic", function () {
    var oObj = {
      abc: {
        "toto_{{ year }}": {
          a: "1",
          b: 2,
        },
      },
    };
    var oTested = new Engine();
    var oContext = {
      year: 2018,
    };
    var oActual = {};
    oTested.evaluateObject(oObj, oContext, oActual);
    assert.deepEqual(oActual, { abc: { toto_2018: { a: "1", b: 2 } } });
  });

  it("evaluateObjectAdvanced", function () {
    var oObj = {
      abc: {
        "toto_{{ years }}": {
          a: "1",
          something: "{{ years }}",
          other: "{{ single }}",
        },
        "titi_{{ years }}": {
          "tutu_{{ years }}": {
            a: "{{ years }}",
          },
        },
      },
    };

    var oExpected = {
      abc: {
        toto_2018: {
          a: "1",
          something: "2018",
          other: "hello world!",
        },
        toto_2019: {
          a: "1",
          something: "2019",
          other: "hello world!",
        },
        toto_2020: {
          a: "1",
          something: "2020",
          other: "hello world!",
        },
        titi_2018: {
          tutu_2018: {
            a: "2018",
          },
          tutu_2019: {
            a: "2019",
          },
          tutu_2020: {
            a: "2020",
          },
        },
        titi_2019: {
          tutu_2018: {
            a: "2018",
          },
          tutu_2019: {
            a: "2019",
          },
          tutu_2020: {
            a: "2020",
          },
        },
        titi_2020: {
          tutu_2018: {
            a: "2018",
          },
          tutu_2019: {
            a: "2019",
          },
          tutu_2020: {
            a: "2020",
          },
        },
      },
    };

    var oTested = new Engine();
    var oContext = {
      years: [2018, 2019, 2020],
      single: "hello world!",
    };
    var oActual = {};
    oTested.evaluateObject(oObj, oContext, oActual);
    assert.deepEqual(oActual, oExpected);
  });

  // Here the problem is tata_{{ single }} breaks the loop for tutu_{{ years }}, so "a": "{{ years }}" is only reduced to "a": "2018".
  it("evaluateObjectAdvancedBreakLoop", function () {
    var oObj = {
      abc: {
        "tutu_{{ years }}": {
          "tata_{{ single }}": {
            a: "{{ years }}",
          },
        },
      },
    };

    var oExpected = {
      abc: {
        tutu_2018: {
          tata_hello: {
            a: "2018",
          },
        },
        tutu_2019: {
          tata_hello: {
            a: "2018",
          },
        },
        tutu_2020: {
          tata_hello: {
            a: "2018",
          },
        },
      },
    };

    var oTested = new Engine();
    var oContext = {
      years: [2018, 2019, 2020],
      single: "hello",
    };
    var oActual = {};
    oTested.evaluateObject(oObj, oContext, oActual);
    assert.deepEqual(oActual, oExpected);
  });

  it("basic", function () {
    var oTested = new Engine();
    var oActual = oTested.evaluate("hello {{ name }}!", { name: "world" });
    console.dir(oActual);
    assert.isNotNull(oActual);
    assert.isArray(oActual);
    assert.deepEqual(["hello world!"], oActual);
  });

  it("basicWithCallback", function (done) {
    var oTested = new Engine();
    oTested.evaluate(
      "hello {{ name }}!",
      { name: "world" },
      (err: Error | null, results: string[]) => {
        if (err) {
          done(err);
        } else {
          try {
            assert.isNotNull(results);
            assert.isArray(results);
            assert.deepEqual(["hello world!"], results);
            done();
          } catch (e) {
            done(e);
          }
        }
      }
    );
  });

  it("mixedVars", function () {
    var oTested = new Engine();
    var oActual = oTested.evaluate("something::{{ today }}::{{ files }}", {
      today: "20200101",
      files: ["file1", "file2"],
    });
    console.dir(oActual);
    assert.isNotNull(oActual);
    assert.isArray(oActual);
    assert.deepEqual(
      ["something::20200101::file1", "something::20200101::file2"],
      oActual
    );
  });

  // Here the problem is tata_{{ single }} breaks the loop for tutu_{{ years }}, so "a": "{{ years }}" is only reduced to "a": "2018".
  it("evaluateObjectAdvanced2", function () {
    var oObj = {
      "tutu_{{ years }}": {
        a: "static",
        b: "{{ years }}",
        c: "{{single}}",
      },
    };

    var oExpected = {
      tutu_2018: {
        a: "static",
        b: "2018",
        c: "hello",
      },
      tutu_2019: {
        a: "static",
        b: "2019",
        c: "hello",
      },
      tutu_2020: {
        a: "static",
        b: "2020",
        c: "hello",
      },
    };

    var oTested = new Engine();
    var oContext = {
      years: [2018, 2019, 2020],
      single: "hello",
    };
    var oActual = {};
    oTested.evaluateObject(oObj, oContext, oActual);
    assert.deepEqual(oActual, oExpected);
  });
});