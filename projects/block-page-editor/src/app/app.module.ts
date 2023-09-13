import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { createCustomElement } from '@angular/elements';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  bootstrap: [ AppComponent ],
  providers: [],
})

export class AppModule {
  constructor(injector: Injector) {
    const banner = createCustomElement(AppComponent, { injector });
    customElements.define('block-page-editor', banner);
  }
}