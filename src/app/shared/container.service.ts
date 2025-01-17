/*
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
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ExtendedDockstoreToolService } from './extended-dockstoreTool/extended-dockstoreTool.service';
import { DockstoreTool } from './swagger/model/dockstoreTool';
import { ToolQuery } from './tool/tool.query';
import { ToolService } from './tool/tool.service';
import { ToolStore } from './tool/tool.store';

/**
 * This is mostly deprecated in favor of ToolService for the selected tool
 * This is still used for the list of all tools
 *
 * @export
 * @class ContainerService
 */
@Injectable()
export class ContainerService {
  tools$ = new BehaviorSubject<DockstoreTool[]>(null); // This contains the list of unsorted tools
  private copyBtnSource = new BehaviorSubject<any>(null); // This is the currently selected copy button.
  copyBtn$ = this.copyBtnSource.asObservable();
  constructor(
    private toolService: ToolService,
    private toolQuery: ToolQuery,
    private toolStore: ToolStore,
    private extendedDockstoreToolService: ExtendedDockstoreToolService
  ) {}
  setTool(tool: any) {
    this.toolService.setTool(tool);
  }
  setTools(tools: any) {
    this.tools$.next(tools);
  }

  addToTools(tools: any, tool: any) {
    tools.push(tool);
    this.tools$.next(tools);
  }

  /**
   * Upsert the new workflow into the current list of workflows (depends on the workflow id)
   * @param tool Workflow to be upserted
   */
  upsertToolToTools(tool: DockstoreTool) {
    const tools = this.tools$.getValue();
    if (!tool || !tools) {
      return;
    }
    const oldWorkflow = tools.find((x) => x.id === tool.id);
    if (oldWorkflow) {
      const index = tools.indexOf(oldWorkflow);
      tools[index] = tool;
    } else {
      tools.push(tool);
    }
    this.setTools(tools);
  }

  /**
   * This function replaces the tool inside of tools with an updated tool.
   * This should eventually use an entity store instead
   *
   * @param {DockstoreTool} newTool the new tool we are replacing
   * @returns
   * @memberof ContainerService
   */
  replaceTool(newTool: DockstoreTool | null) {
    const tools = this.tools$.getValue();
    if (!tools) {
      console.error('tools in state is falsey');
      return;
    }
    if (!newTool) {
      return;
    }
    const oldTool = tools.find((x) => x.id === newTool.id);
    const index = tools.indexOf(oldTool);
    tools[index] = newTool;
    this.setTools(tools);
  }

  setCopyBtn(copyBtn: any) {
    this.copyBtnSource.next(copyBtn);
  }

  updateActiveTopic(topicManual: string) {
    const newTool = { ...this.toolQuery.getActive(), topicManual: topicManual };
    this.toolStore.upsert(newTool.id, newTool);
    this.extendedDockstoreToolService.update(newTool);
  }

  updateActiveTopicSelection(topicSelection: DockstoreTool.TopicSelectionEnum) {
    const newWorkflow = { ...this.toolQuery.getActive(), topicSelection: topicSelection };
    this.toolStore.upsert(newWorkflow.id, newWorkflow);
    this.extendedDockstoreToolService.update(newWorkflow);
  }
}
