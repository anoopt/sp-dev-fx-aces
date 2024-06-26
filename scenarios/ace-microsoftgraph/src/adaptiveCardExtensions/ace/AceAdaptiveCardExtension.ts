import { User } from '@microsoft/microsoft-graph-types';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { AcePropertyPane } from './AcePropertyPane';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';

export interface IAceAdaptiveCardExtensionProps {
  title: string;
}

export interface IAceAdaptiveCardExtensionState {
  name?: string;
}

const CARD_VIEW_REGISTRY_ID: string = 'Ace_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'Ace_QUICK_VIEW';

export default class AceAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IAceAdaptiveCardExtensionProps,
  IAceAdaptiveCardExtensionState
> {
  private _deferredPropertyPane: AcePropertyPane | undefined;

  public onInit(): Promise<void> {
    this.state = {};

    this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
    this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());

    return this._fetchData();
  }

  protected loadPropertyPaneResources(): Promise<void> {
    return import(
      /* webpackChunkName: 'Ace-property-pane'*/
      './AcePropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.AcePropertyPane();
        }
      );
  }

  protected renderCard(): string | undefined {
    return CARD_VIEW_REGISTRY_ID;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return this._deferredPropertyPane!.getPropertyPaneConfiguration();
  }

  private _fetchData(): Promise<void> {
    return this.context.msGraphClientFactory
      .getClient("3")
      .then(client => client.api('me').get())
      .then((user: User) => {
        this.setState({
          name: user.displayName
        });
      });
  }
}
