import { Injectable } from '@angular/core';

import { Dockstore } from './dockstore.model';
import { HttpService } from './http.service';
import { Subject } from 'rxjs/Subject';
@Injectable()
export class WorkflowService {
  private workflowSource = new Subject<any>();
  // Observable streams
  workflow$ = this.workflowSource.asObservable();
  constructor(private httpService: HttpService) {}
  setWorkflow(workflow: any) {
    this.workflowSource.next(workflow);
  }
  getParamsString(path: string, tagName: string) {
    return 'dockstore workflow convert entry2json --entry ' + path + ':' + tagName + ` > Dockstore.json
            \nvim Dockstore.json`;
  }

  getCliString(path: string, tagName: string) {
    return 'dockstore workflow launch --entry ' + path + ':' + tagName + ' --json Dockstore.json';
  }

  getCwlString(path: string, tagName: string) {
    return 'cwltool --non-strict https://www.dockstore.org:8443/api/ga4gh/v1/workflows/'
           + encodeURIComponent(path)
           + '/versions/'
           + tagName
           + '/plain-CWL/descriptor Dockstore.json';
  }
  getTestJson(workflowId: string, versionName: string) {
    const workflowTestUrl = Dockstore.API_URI + '/workflows/' + workflowId + '/testParameterFiles?version=' + versionName;
    return this.httpService.getResponse(workflowTestUrl);
  }

  getDescriptors(versions, version) {
    if (versions.length && version) {

      const typesAvailable = new Array();

      for (const file of version.sourceFiles) {
        const type = file.type;
        if (type === 'DOCKSTORE_CWL' && !typesAvailable.includes('cwl')) {
          typesAvailable.push('cwl');

        } else if (type === 'DOCKSTORE_WDL' && !typesAvailable.includes('wdl')) {
          typesAvailable.push('wdl');
        }
      }
      return typesAvailable;
    }
  }
}