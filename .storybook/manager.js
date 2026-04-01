import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

import OdinLogo from "../docs/img/odin_react_logo.png";

const customTheme = create({
    brandTitle: "Odin React",
    brandImage: OdinLogo,
    
});

addons.setConfig({
    theme: customTheme
})
