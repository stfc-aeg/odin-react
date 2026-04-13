import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

import OdinLogo from "../public/odin-react-logo.svg";

export const customTheme = create({
    base: "normal",
    brandTitle: "Odin React",
    brandImage: OdinLogo,
    
});

addons.setConfig({
    theme: customTheme
});
