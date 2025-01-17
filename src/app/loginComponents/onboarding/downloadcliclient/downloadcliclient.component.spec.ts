import { ClipboardModule } from '@angular/cdk/clipboard';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AuthService } from 'ng2-ui-auth';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MarkdownModule } from 'ngx-markdown';
import { MetadataService } from '../../../shared/swagger';
import { GA4GHService } from './../../../shared/swagger/api/gA4GH.service';
import { RouterLinkStubDirective, RouterOutletStubComponent } from './../../../test/router-stubs';
import { AuthStubService, GA4GHStubService } from './../../../test/service-stubs';
import { DownloadCLIClientComponent } from './downloadcliclient.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('DownloadCLIClientComponent', () => {
  let component: DownloadCLIClientComponent;
  let fixture: ComponentFixture<DownloadCLIClientComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DownloadCLIClientComponent, RouterLinkStubDirective, RouterOutletStubComponent],
        imports: [
          ClipboardModule,
          MarkdownModule.forRoot(),
          MatIconModule,
          MatButtonModule,
          HttpClientTestingModule,
          MatSnackBarModule,
          MatTabsModule,
          NoopAnimationsModule,
        ],
        providers: [
          { provide: AuthService, useClass: AuthStubService },
          { provide: GA4GHService, useClass: GA4GHStubService },
          MetadataService,
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadCLIClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
