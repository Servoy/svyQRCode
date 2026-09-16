import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ServoyPublicModule } from '@servoy/public';
import { SvyQRCodeScanner } from './scanner/scanner';
import { SvyQRCodeGenerator } from './generator/generator';

@NgModule({
    declarations: [
        SvyQRCodeScanner,
        SvyQRCodeGenerator
    ],
    imports: [
        CommonModule,
        ServoyPublicModule
    ],
    exports: [
        SvyQRCodeScanner,
        SvyQRCodeGenerator
    ]
})
export class SvyQRCodeModule { }
