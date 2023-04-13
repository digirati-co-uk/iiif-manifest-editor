type CCDefinition = {
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  value: string;
  url: string;
  legal: string;
};

const CC0 = "http://creativecommons.org/publicdomain/zero/1.0/";
const CC_BY = "http://creativecommons.org/licenses/by/4.0/";
const CC_BY_SA = "http://creativecommons.org/licenses/by-sa/4.0/";
const CC_BY_ND = "http://creativecommons.org/licenses/by-nd/4.0/";
const CC_BY_NC = "http://creativecommons.org/licenses/by-nc/4.0/";
const CC_BY_NC_SA = "http://creativecommons.org/licenses/by-nc-sa/4.0/";
const CC_BY_NC_ND = "http://creativecommons.org/licenses/by-nc-nd/4.0/";

export const allRights = [CC0, CC_BY, CC_BY_SA, CC_BY_ND, CC_BY_NC, CC_BY_NC_SA, CC_BY_NC_ND];

export const creativeCommons: CCDefinition[] = [
  {
    label: "Public Domain",
    shortLabel: "CC0",
    description:
      "The person who associated a work with this deed has dedicated the work to the public domain by waiving all of his or her rights to the work worldwide under copyright law, including all related and neighboring rights, to the extent allowed by law.",
    icon: "https://licensebuttons.net/p/zero/1.0/88x31.png",
    value: CC0,
    url: "https://creativecommons.org/publicdomain/zero/1.0/",
    legal: "https://creativecommons.org/publicdomain/zero/1.0/legalcode",
  },
  {
    label: "Attribution",
    shortLabel: "CC BY",
    description:
      "This license lets others distribute, remix, adapt, and build upon your work, even commercially, as long as they credit you for the original creation. This is the most accommodating of licenses offered. Recommended for maximum dissemination and use of licensed materials.",
    icon: "https://licensebuttons.net/l/by/3.0/88x31.png",
    value: CC_BY,
    url: "https://creativecommons.org/licenses/by/4.0/",
    legal: "http://creativecommons.org/licenses/by/4.0/legalcode",
  },
  {
    label: "Attribution-ShareAlike",
    shortLabel: "CC BY-SA",
    description:
      "This license lets others remix, adapt, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms. This license is often compared to “copyleft” free and open source software licenses. All new works based on yours will carry the same license, so any derivatives will also allow commercial use. This is the license used by Wikipedia, and is recommended for materials that would benefit from incorporating content from Wikipedia and similarly licensed projects.",
    icon: "https://licensebuttons.net/l/by-sa/3.0/88x31.png",
    value: CC_BY_SA,
    url: "https://creativecommons.org/licenses/by-sa/4.0/",
    legal: "http://creativecommons.org/licenses/by-sa/4.0/legalcode",
  },
  {
    label: "Attribution-NoDerivs",
    shortLabel: "CC BY-ND",
    description:
      "This license lets others reuse the work for any purpose, including commercially; however, it cannot be shared with others in adapted form, and credit must be provided to you.",
    icon: "https://licensebuttons.net/l/by-nd/3.0/88x31.png",
    value: CC_BY_ND,
    url: "https://creativecommons.org/licenses/by-nd/4.0/",
    legal: "http://creativecommons.org/licenses/by-nd/4.0/legalcode",
  },
  {
    label: "Attribution-NonCommercial",
    shortLabel: "CC BY-NC",
    description:
      "This license lets others remix, adapt, and build upon your work non-commercially, and although their new works must also acknowledge you and be non-commercial, they don’t have to license their derivative works on the same terms.",
    icon: "https://licensebuttons.net/l/by-nc/3.0/88x31.png",
    value: CC_BY_NC,
    url: "https://creativecommons.org/licenses/by-nc/4.0/",
    legal: "http://creativecommons.org/licenses/by-nc/4.0/legalcode",
  },
  {
    label: "Attribution-NonCommercial-ShareAlike",
    shortLabel: "CC BY-NC-SA",
    description:
      "This license lets others remix, adapt, and build upon your work non-commercially, as long as they credit you and license their new creations under the identical terms.",
    icon: "https://licensebuttons.net/l/by-nc-sa/3.0/88x31.png",
    value: CC_BY_NC_SA,
    url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    legal: "http://creativecommons.org/licenses/by-nc-sa/4.0/legalcode",
  },
  {
    label: "Attribution-NonCommercial-NoDerivs",
    shortLabel: "CC BY-NC-ND",
    description:
      "This license is the most restrictive of our six main licenses, only allowing others to download your works and share them with others as long as they credit you, but they can’t change them in any way or use them commercially.",
    icon: "https://licensebuttons.net/l/by-nc-nd/3.0/88x31.png",
    value: CC_BY_NC_ND,
    url: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
    legal: "http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode",
  },
];
