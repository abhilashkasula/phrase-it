const createEditor = (id, placeholder) => {
  return new EditorJS({
    holder: id,
    tools: {
      header: {
        class: Header,
        config: {
          levels: [2, 3, 4],
          defaultLevel: 2,
        },
      },
      delimiter: Delimiter,
      inlineCode: InlineCode,
    },
    placeholder
  });
};
