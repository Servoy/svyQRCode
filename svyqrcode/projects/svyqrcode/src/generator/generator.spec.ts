import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ServoyApiTesting, ServoyPublicTestingModule } from '@servoy/public';

import { SvyQRCodeGenerator } from './generator';

describe('SvyQRCodeGenerator', () => {
    let component: SvyQRCodeGenerator;
    let fixture: ComponentFixture<SvyQRCodeGenerator>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SvyQRCodeGenerator],
            imports: [ServoyPublicTestingModule],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(SvyQRCodeGenerator);
        component = fixture.componentInstance;
        component.servoyApi = new ServoyApiTesting();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return a valid native element from getNativeElement()', () => {
        fixture.detectChanges();
        expect(component.getNativeElement()).not.toBeNull();
        expect(component.getNativeElement()).toBeInstanceOf(HTMLElement);
    });
});
