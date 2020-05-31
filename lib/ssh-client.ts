import * as path from "path";
import { Client } from "ssh2";
import * as Fs from "fs";

const DEBUG = false;

type Callback = (
  err: Error | null,
  stdout: string,
  stderr: string,
  server: any,
  conn: Client
) => void;

/**
 * @param pClientOpts client options
 * @param pCmd command
 * @param pCallback callback
 */
function ssh2Exec(pClientOpts: any, pCmd: string, pCallback: Callback): void {
  let stdout: string;
  let stderr: string;
  let err: Error;
  let code: any;
  // var signal = null;
  let callbackCalled = false;
  let timeoutCallback: any;

  /**
   * @param conn client
   */
  function doCallback(conn: Client): void {
    if (!err && (stderr || code)) {
      err = new Error(stderr || code);
    }
    if (!callbackCalled) {
      callbackCalled = true;
      if (timeoutCallback) clearInterval(timeoutCallback);
      pCallback(err, stdout, stderr, null, conn);
    }
  }

  const conn = new Client();
  // console.log('ssh2_exec: 1');
  conn
    .on("ready", function() {
      conn.exec(pCmd, function(pErr, stream) {
        if (pErr) {
          err = pErr;
          doCallback(conn);
          // pCallback( err, "", "", null, conn );
          return;
        }
        if (DEBUG) console.log("### ssh-client: stream....");
        stream
          .on("close", function(pCode: any) {
            code = pCode;
            // signal = pSignal;
            if (DEBUG) {
              // console.log("Stream :: close :: code: " + code + ", signal: " + signal);
              console.log("### ssh-client: close() (1) code = " + pCode);
              console.log("### ssh-client: stdout?" + (stdout ? true : false));
              console.log(stdout);
            }
            doCallback(conn);
          })
          .on("data", function(pData: Buffer) {
            // console.log("### ssh-client: data = " + typeof pData);
            // console.log(pData);
            stdout = stdout
              ? stdout.concat(pData.toString())
              : pData.toString();
          })
          .on("error", function(_pData: any) {
            // console.log('error');
            // TODO
            // stdout = data;
          })
          .on("end", function(_pData: any) {
            // TODO?
            // stdout = data;
            if (DEBUG) console.log("### ssh-client: end()");
          })
          .on("exit", function(_pData: any) {
            // TODO?
            // stdout = data;
            if (DEBUG) console.log("### ssh-client: exit()");
          })
          .stderr.on("data", function(pData: Buffer) {
            stderr = stdout
              ? stderr.concat(pData.toString())
              : pData.toString();
            // if (timeoutCallback) clearInterval(timeoutCallback);
            // timeoutCallback = setInterval(doCallback, 100);
            // No documentation saying this would be the end of it. When calling dfuplus, nothing happens afterwards.
            // pCallback( err, stdout, stderr, null, conn );
          })
          .on("close", function(_code: any, _signal: any) {
            // TODO?
            if (DEBUG) console.log("### ssh-client: close() (2)");
          });
      });
    })
    .on("error", function(pErr) {
      err = pErr;
      doCallback(conn);
      // pCallback(err, "", "", null, conn);
    })
    .connect(pClientOpts);
}

/**
 * @param pClientOpts client options
 * @param pRemoteFile remote file path
 * @param pContent content
 * @param pCallback callback
 */
function ssh2WriteToFile(
  pClientOpts: any,
  pRemoteFile: string,
  pContent: any,
  pCallback: Callback
): void {
  pRemoteFile = pRemoteFile.replace(/[\\]/g, "/"); // windows needs this
  const remotePath = path.dirname(pRemoteFile);
  ssh2Exec(pClientOpts, "mkdir -p " + remotePath, function(
    err,
    stdout,
    stderr,
    server,
    conn
  ) {
    if (err) {
      pCallback(err, stdout, stderr, server, conn);
      return;
    }

    conn.sftp(function sftpOpen(err, sftp) {
      if (err) {
        pCallback(err, "", "", server, conn);
        return;
      }

      try {
        // debug('stream start');
        const wStream = sftp.createWriteStream(pRemoteFile, {
          flags: "w+"
          // autoClose: true,
        });
        wStream.on("error", function(err) {
          // debug('stream error %j', err);
          wStream.removeAllListeners("finish");
          pCallback(err, "", "", server, conn);
        });
        wStream.on("finish", function() {
          // wStream.close();
          pCallback(null, "", "", server, conn);
        });
        wStream.end("" + pContent);
      } catch (ex) {
        pCallback(ex, "", "", server, conn);
      }
    });
  });
}

export class SSHClient {
  exec(pClientOpts: any, pCmd: string, pCallback: Callback): void {
    if (pClientOpts.privateKey && Fs.existsSync(pClientOpts.privateKey)) {
      pClientOpts.privateKey = Fs.readFileSync(pClientOpts.privateKey, {
        encoding: "utf8"
      });
    }
    // SSH2Utils.exec( pClientOpts, pCmd, pCallback); //function(err, stdout, stderr, server, conn){
    ssh2Exec(pClientOpts, pCmd, pCallback);
  }
  writeFile(
    pClientOpts: any,
    pFilename: string,
    pContent: any,
    pCallback: Callback
  ): void {
    if (pClientOpts.privateKey && Fs.existsSync(pClientOpts.privateKey)) {
      pClientOpts.privateKey = Fs.readFileSync(pClientOpts.privateKey, {
        encoding: "utf8"
      });
    }
    // SSH2Utils.writeFile( pClientOpts, pFilename, pContent, pCallback );
    ssh2WriteToFile(pClientOpts, pFilename, pContent, pCallback);
  }
}
