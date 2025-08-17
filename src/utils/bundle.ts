type BundleEntry = {
  resource: {
    id: string;
    code: {
      coding: {
        display: string;
      }[];
    };
  };
};

export type Bundle = {
  entry: BundleEntry[];
};