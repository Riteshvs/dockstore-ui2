/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { DateService } from '../../shared/date.service';
import { DockstoreService } from '../../shared/dockstore.service';
import { CustomMaterialModule } from '../../shared/modules/material.module';
import { DockstoreStubService, SearchStubService } from '../../test/service-stubs';
import { SearchService } from '../state/search.service';
import { SearchWorkflowTableComponent } from './search-workflow-table.component';
import { DescriptorLanguageService } from '../../shared/entry/descriptor-language.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SearchWorkflowTableComponent', () => {
  let component: SearchWorkflowTableComponent;
  let fixture: ComponentFixture<SearchWorkflowTableComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SearchWorkflowTableComponent],
        schemas: [NO_ERRORS_SCHEMA],
        imports: [CustomMaterialModule, BrowserAnimationsModule, RouterTestingModule, HttpClientTestingModule],
        providers: [
          { provide: DockstoreService, useClass: DockstoreStubService },
          DateService,
          { provide: SearchService, useClass: SearchStubService },
          { provide: DescriptorLanguageService, useClass: DescriptorLanguageService },
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchWorkflowTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.galaxyShortfriendlyName === 'Galaxy');
  });
});
