# layer-slider

> Part of the [VC Map Project](https://github.com/virtualcitySYSTEMS/map-ui)

The **Layer Slider** plugin allows to control different layers via a slider to visualize layers concurrently.

## Configuration

The plugin does not have any plugin-level options. Add a `SliderContentTreeItem` to the application's `contentTree` configuration for each slider. The slider switches between the layers listed in `layerNames`; `labels` supplies the corresponding text shown for each layer. Both arrays must use the same order and contain the same number of entries.

The following properties can be configured on a slider item:

| Property        | Type     | Default                   | Description                                                           |
| --------------- | -------- | ------------------------- | --------------------------------------------------------------------- |
| `name`          | `string` | required                  | Unique content-tree item name and window ID.                          |
| `title`         | `string` | required                  | Title of the content-tree item.                                       |
| `layerNames`    | `Array`  | `[]`                      | Names of the layers to switch between.                                |
| `labels`        | `Array`  | `[]`                      | Labels displayed by the slider, in the same order as `layerNames`.    |
| `actionTooltip` | `string` | `layerSlider.openTooltip` | Tooltip for the content-tree action that opens and closes the slider. |
| `actionIcon`    | `string` | `mdi-tune-variant`        | Icon for the content-tree action.                                     |
| `windowOptions` | `object` | See defaults below        | Optional window position and header configuration.                    |
| `onActivate`    | `Array`  | `[]`                      | Standard VC Map callbacks executed after item activation.             |
| `onDeactivate`  | `Array`  | `[]`                      | Standard VC Map callbacks executed after item deactivation.           |

The action tooltip and icon are configured independently from the window header. By default, the slider window is `400px` wide, `120px` high, and uses `layerSlider.title` as its header title and `mdi-tune-variant` as its header icon.

Callbacks use the same configuration as other content-tree items. Closing only the slider window or switching between slider layers does not execute these callbacks.

For example:

```json
{
  "contentTree": [
    {
      "name": "imagery-slider",
      "type": "SliderContentTreeItem",
      "title": "Compare imagery",
      "layerNames": ["imagery-2020", "imagery-2024"],
      "labels": ["2020", "2024"],
      "actionTooltip": "layerSlider.openTooltip",
      "actionIcon": "mdi-tune-variant",
      "windowOptions": {
        "position": {
          "width": "480",
          "height": "120"
        },
        "state": {
          "headerTitle": "Imagery",
          "headerIcon": "mdi-image-multiple"
        }
      }
    }
  ]
}
```
