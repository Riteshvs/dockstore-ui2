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

import { LoginService } from './login.service';
import { Configuration } from './../shared/swagger/configuration';
import { UsersStubService, ConfigurationStub } from './../test/service-stubs';
import { UsersService } from '../shared/swagger';
import { AuthStubService } from '../test/service-stubs';
import { AuthService } from 'ng2-ui-auth/commonjs/auth.service';
import { TestBed, inject } from '@angular/core/testing';

describe('LoginService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [LoginService,
                { provide: AuthService, useClass: AuthStubService}
            ],
        });
    });

    it('should be created', inject([LoginService], (service: LoginService) => {
        expect(service).toBeTruthy();
    }));
    it('should be able to authenticate', inject([LoginService], (service: LoginService) => {
        service.authenticate('github').subscribe(user => {
            expect(user).toEqual({});
        });
    }));
});