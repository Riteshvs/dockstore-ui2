/**
 *    Copyright 2017 OICR
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */
import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Base } from 'app/shared/base';
import { takeUntil } from 'rxjs/operators';
import { ga4ghPath } from '../../shared/constants';
import { Dockstore } from '../../shared/dockstore.model';
import { ExtendedToolsService } from '../../shared/extended-tools.service';
import { ExtendedDockstoreTool } from '../../shared/models/ExtendedDockstoreTool';
import { SessionQuery } from '../../shared/session/session.query';
import { ToolDescriptor, ToolVersion, WorkflowVersion } from '../../shared/swagger';
import { DockstoreTool } from '../../shared/swagger/model/dockstoreTool';
import { Tag } from '../../shared/swagger/model/tag';
import { exampleDescriptorPatterns, validationDescriptorPatterns } from '../../shared/validationMessages.model';
import { InfoTabService } from './info-tab.service';

import DescriptorTypeEnum = ToolVersion.DescriptorTypeEnum;

@Component({
  selector: 'app-info-tab',
  templateUrl: './info-tab.component.html',
  styleUrls: ['./info-tab.component.css'],
})
export class InfoTabComponent extends Base implements OnInit, OnChanges {
  currentVersion: Tag;
  @Input() validVersions: Array<WorkflowVersion | Tag>;
  @Input() selectedVersion: Tag;
  @Input() privateOnlyRegistry: boolean;
  @Input() extendedDockstoreTool: ExtendedDockstoreTool;
  public validationPatterns = validationDescriptorPatterns;
  public exampleDescriptorPatterns = exampleDescriptorPatterns;
  public DockstoreToolType = DockstoreTool;
  public tool: DockstoreTool;
  public topicEditing: boolean;
  public TopicSelectionEnum = DockstoreTool.TopicSelectionEnum;
  dockerFileEditing: boolean;
  cwlPathEditing: boolean;
  wdlPathEditing: boolean;
  cwlTestPathEditing: boolean;
  wdlTestPathEditing: boolean;
  isPublic: boolean;
  trsLinkCWL: string;
  trsLinkWDL: string;
  downloadZipLink: string;
  isValidVersion = false;
  Dockstore = Dockstore;
  constructor(private infoTabService: InfoTabService, private sessionQuery: SessionQuery, private containersService: ExtendedToolsService) {
    super();
  }

  ngOnChanges() {
    this.tool = JSON.parse(JSON.stringify(this.extendedDockstoreTool));
    if (this.selectedVersion && this.tool) {
      this.currentVersion = this.selectedVersion;
      this.isValidVersion = this.validVersions.some((version: Tag) => version.id === this.selectedVersion.id);
      this.downloadZipLink = Dockstore.API_URI + '/containers/' + this.tool.id + '/zip/' + this.currentVersion.id;
      if (this.tool.descriptorType.includes(DescriptorTypeEnum.CWL)) {
        this.trsLinkCWL = this.getTRSLink(
          this.tool.tool_path,
          this.currentVersion.name,
          ToolDescriptor.TypeEnum.CWL,
          this.currentVersion.cwl_path
        );
      }
      if (this.tool.descriptorType.includes(DescriptorTypeEnum.WDL)) {
        this.trsLinkWDL = this.getTRSLink(
          this.tool.tool_path,
          this.currentVersion.name,
          ToolDescriptor.TypeEnum.WDL,
          this.currentVersion.wdl_path
        );
      }
    } else {
      this.isValidVersion = false;
      this.trsLinkCWL = null;
      this.trsLinkWDL = null;
    }
  }

  ngOnInit() {
    this.infoTabService.dockerFileEditing$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((editing) => (this.dockerFileEditing = editing));
    this.infoTabService.cwlPathEditing$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((editing) => (this.cwlPathEditing = editing));
    this.infoTabService.wdlPathEditing$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((editing) => (this.wdlPathEditing = editing));
    this.infoTabService.cwlTestPathEditing$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((editing) => (this.cwlTestPathEditing = editing));
    this.infoTabService.wdlTestPathEditing$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((editing) => (this.wdlTestPathEditing = editing));
    this.infoTabService.topicEditing$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((topicEditing) => (this.topicEditing = topicEditing));
    this.sessionQuery.isPublic$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((publicPage) => (this.isPublic = publicPage));
  }

  downloadZip() {
    this.containersService.getToolZip(this.tool.id, this.currentVersion.id, 'response').subscribe((data: HttpResponse<any>) => {
      const blob = new Blob([data.body], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    });
  }

  toggleEditTopic() {
    if (this.topicEditing) {
      this.infoTabService.saveTopic(this.tool, this.revertTopic.bind(this));
    }
    this.infoTabService.setTopicEditing(!this.topicEditing);
  }

  revertTopic() {
    this.tool.topicManual = this.extendedDockstoreTool.topicManual;
  }

  revertTopicSelection() {
    this.tool.topicSelection = this.extendedDockstoreTool.topicSelection;
  }

  topicSelectionChange() {
    this.infoTabService.saveTopicSelection(this.tool, this.revertTopicSelection.bind(this));
  }

  toggleEditDockerFile() {
    if (this.dockerFileEditing) {
      this.infoTabService.updateAndRefresh(this.tool);
    }
    this.infoTabService.setDockerFileEditing(!this.dockerFileEditing);
  }

  toggleEditCWLPath() {
    if (this.cwlPathEditing) {
      this.infoTabService.updateAndRefresh(this.tool);
    }
    this.infoTabService.setCWLPathEditing(!this.cwlPathEditing);
  }

  toggleEditWDLPath() {
    if (this.wdlPathEditing) {
      this.infoTabService.updateAndRefresh(this.tool);
    }
    this.infoTabService.setWDLPathEditing(!this.wdlPathEditing);
  }

  toggleEditCWLTestPath() {
    if (this.cwlTestPathEditing) {
      this.infoTabService.updateAndRefresh(this.tool);
    }
    this.infoTabService.setCWLTestPathEditing(!this.cwlTestPathEditing);
  }
  toggleEditWDLTestPath() {
    if (this.wdlTestPathEditing) {
      this.infoTabService.updateAndRefresh(this.tool);
    }
    this.infoTabService.setWDLTestPathEditing(!this.wdlTestPathEditing);
  }

  somethingIsBeingEdited(): boolean {
    return (
      this.dockerFileEditing ||
      this.cwlPathEditing ||
      this.wdlPathEditing ||
      this.cwlTestPathEditing ||
      this.wdlTestPathEditing ||
      this.topicEditing
    );
  }

  /**
   * Cancel button function
   *
   * @memberof InfoTabComponent
   */
  cancelEditing(): void {
    this.infoTabService.cancelEditing();
    this.revertTopic();
  }

  /**
   * Returns a link to the primary descriptor for the given tool version
   * @param path tool path
   * @param versionName name of version
   * @param descriptorType descriptor type (CWL or WDL)
   * @param descriptorPath primary descriptor path
   */
  getTRSLink(path: string, versionName: string, descriptorType: ToolDescriptor.TypeEnum, relativePath: string): string {
    return (
      `${Dockstore.API_URI}${ga4ghPath}/tools/${encodeURIComponent(path)}` +
      `/versions/${encodeURIComponent(versionName)}/plain-` +
      descriptorType +
      `/descriptor/` +
      relativePath
    );
  }
}
