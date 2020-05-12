import * as Promises from "./promises";
import TemplateEngine from "./templating/engine";
import { createLogger } from "./logger";
import Mod from "./mod";
import { IETL } from "./etl";
import Context from "./context";
import { Executor } from "./executors";

const LOGGER = createLogger("etljs::image-charts");

export type Data = {
  error?: Error | null;
  result?: any | null;
  message?: string | null;
  exit: boolean;
  pass: boolean;
  skip: boolean;
  _stdout?: string | null;
  _stderr?: string | null;
};

var asPromised = function (
  pPreviousData: any,
  pKey: string,
  func: (result: any) => void,
  data: any
) {
  if (!pPreviousData.image_charts[pKey]) pPreviousData.image_charts[pKey] = {};
  pPreviousData.image_charts[pKey] = data;
  func(pPreviousData);
};

var create_image_charts_url = function (pArgs: string[]) {
  var oArgs = pArgs.join("&");
  return "https://image-charts.com/chart?" + oArgs;
};

var get_data_file_content = function (
  pParent: string,
  pKey: string,
  pDataFile: string,
  pCmdOptions: any,
  pExecutor: Executor
): Promise<Data> {
  return new Promise(function (resolve, reject) {
    LOGGER.debug("[%s] Getting data file content...", pParent);
    pExecutor.exec("cat " + pDataFile, pCmdOptions, function (
      error,
      stdout,
      stderr
    ) {
      var data: Data = {
        error: error,
        exit: false,
        pass: error == null,
        skip: false,
        _stdout: stdout,
        _stderr: stderr,
      };
      if (error) {
        reject(data);
      } else {
        LOGGER.debug(
          "[%s] Done getting data file content for [%s].",
          pParent,
          pKey
        );
        resolve(data);
      }
    });
  });
};

export default class ImageChartsMod implements Mod {
  mSettings: any;
  mTemplateEngine: TemplateEngine;
  constructor(pETL: IETL, pSettings?: any) {
    this.mSettings = pSettings || {};
    var that = this;
    if (pETL)
      pETL.mod("image_charts", this, function (pSettings: any) {
        that.mSettings = {
          ...that.mSettings,
          ...pSettings,
        };
      });
    this.mTemplateEngine = new TemplateEngine();
  }
  _evaluate(pTemplate: string, pContext: Context) {
    //TODO: Not sure I want to do this. This would make "files" handling "context" that might be different than other mods.
    //For example, "files" might accept $._current and others may not. Best if using path in template is the same across everything.
    // Having said that, a mod then cannot access the results of another mod within the same activity...

    /*
      var oContext = JSON.parse(JSON.stringify(pContext.global));
      oContext['_current'] = JSON.parse(JSON.stringify(pContext.local));
      console.log('Merged context=');
      console.dir( oContext );
      var oResult = this.mTemplateEngine.evaluate( pTemplate, oContext );
      console.log('Result=');
      console.dir( oResult );
      */
    return this.mTemplateEngine.evaluate(pTemplate, pContext);
  }
  _exec(
    pParent: string,
    pKey: string,
    pSpecs: any,
    pExecutor: Executor,
    pContext: Context
  ) {
    var that = this;
    return function (pPreviousData: any) {
      return new Promise(function (resolve, reject) {
        try {
          LOGGER.debug("[%s] Creating image-charts [%s]...", pParent, pKey);
          const oChartArgs: string[] = [];
          for (var i in pSpecs) {
            switch (i) {
              case "chs":
                oChartArgs.push("chs=" + pSpecs[i]);
                break;
              case "cht":
                oChartArgs.push("cht=" + pSpecs[i]);
                break;
              case "chtt":
                var oTitle = pSpecs[i];
                if (oTitle) {
                  if (oTitle.indexOf("{{") >= 0) {
                    const v = that._evaluate(oTitle, pContext);
                    if (v) oTitle = v[0];
                  }
                  oChartArgs.push("chtt=" + oTitle);
                }
                break;
              case "chxt":
                oChartArgs.push("chxt=" + pSpecs[i]);
                break;
              case "chxs":
                oChartArgs.push("chxs=" + pSpecs[i]);
                break;
              default:
                //TODO
                break;
            }
          }
          var oChartDataFile = pSpecs["data"];
          oChartDataFile =
            oChartDataFile.indexOf("{{") < 0
              ? oChartDataFile
              : that._evaluate(oChartDataFile, pContext);

          var oCmdOptions: any = {};
          oCmdOptions["context"] = pKey;

          get_data_file_content(
            pParent,
            pKey,
            oChartDataFile,
            oCmdOptions,
            pExecutor
          ).then(
            function (pData: Data) {
              var data: Data = {
                ...pData,
                exit: false,
                pass: true,
              };
              var func = resolve;
              if (data.error) {
                func = reject;
              } else {
                var oArgs = data._stdout?.split(/\r?\n/);
                if (oArgs && oArgs.length >= 3) {
                  oChartArgs.push("chxl=0:|" + oArgs[0]);
                  oChartArgs.push("chdl=" + oArgs[1]);
                  oChartArgs.push("chd=a:" + oArgs[2]);
                  var url = create_image_charts_url(oChartArgs);
                  LOGGER.info("[%s] Url for [%s]:\n%s", pParent, pKey, url);

                  data.result = url;
                  //oResult.push( url );
                } else {
                  func = reject;
                  data.error = new Error("Invalid data for image-charts.");
                  LOGGER.error(
                    "[%s] Could not parse output: [%s]. Could not create chart url from it.",
                    pParent,
                    data
                  );
                }
              }
              asPromised(pPreviousData, pKey, func, data);
              //resolve( oResult );
            },
            function (error) {
              //console.log( error );
              //reject( error );
              asPromised(pPreviousData, pKey, reject, {
                error: error,
                result: null,
              });
            }
          );
        } catch (e) {
          LOGGER.error(
            "[%s] Unexpected error creating image-chart [%s].",
            pParent,
            pKey
          );
          reject(e);
        }
      });
    };
  }
  handle(
    pParent: string,
    pConfig: any,
    pExecutor: Executor,
    pContext: Context
  ) {
    //pCurrentActivityResult, pGlobalResult, pContext ) {
    //var oTemplateContext = this.mTemplateEngine.create_context( pCurrentActivityResult, pGlobalResult, pContext );
    var that = this;
    return new Promise(function (resolve, reject) {
      LOGGER.debug("[%s] Processing image-charts...", pParent);
      try {
        var oData = { image_charts: {} };
        var oPromises = [];
        for (var i in pConfig) {
          var oKey = i;
          if (oKey.indexOf("{{") >= 0) {
            const v = that._evaluate(oKey, pContext);
            if (v) oKey = v[0];
          }
          oPromises.push(
            that._exec(pParent, oKey, pConfig[i], pExecutor, pContext)
          );
        }
        Promises.seq(oPromises, oData).then(
          function () {
            LOGGER.debug("[%s] Done processing image-charts.", pParent);
            resolve(oData);
          },
          function (pError) {
            LOGGER.error(
              "[%s] Unexpected error running image-charts.",
              pParent,
              pError
            );
            reject(pError);
          }
        );
      } catch (e) {
        LOGGER.error(
          "[%s] Unexpected error processing image-charts.",
          pParent,
          e
        );
        reject(e);
      }
    });
  }
}