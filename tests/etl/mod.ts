import { createLogger } from "../../lib/logger";
import Mod from "../../lib/mod";
import { IETL } from "../../lib/etl";
import { Executor } from "../../lib/executors";

const LOGGER = createLogger("etljs::etl::test");

export default class ModMod implements Mod {
  mSettings: any;
  mCalls: number;
  constructor(pETL: IETL, pSettings?: any) {
    this.mSettings = pSettings || {};
    var that = this;
    if (pETL)
      pETL.mod("moder", this, function (pSettings: any) {
        that.mSettings = pSettings;
      });
    this.mCalls = 0;
  }
  calls(): number {
    return this.mCalls;
  }
  handle(pParent: string, _pConfig: any, _pExecutor: Executor) {
    var that = this;
    return new Promise(function (resolve, _reject) {
      that.mCalls++;
      LOGGER.debug(
        "[%s] In mod mod. Settings: hello=%s",
        pParent,
        that.mSettings["hello"]
      );
      resolve();
    });
  }
}
