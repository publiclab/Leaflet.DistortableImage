describe('powers', () => {
  it('generates squares', () => {
    const squares = powers(2);

    expect(squares.next().value).toEqual(1);
    expect(squares.next().value).toEqual(4);
    expect(squares.next().value).toEqual(9);
    expect(squares.next().value).toEqual(16);
    expect(squares.next().value).toEqual(25);
  });

  it('generates cubes', () => {
    const squares = powers(3);

    expect(squares.next().value).toEqual(1);
    expect(squares.next().value).toEqual(8);
    expect(squares.next().value).toEqual(27);
    expect(squares.next().value).toEqual(64);
    expect(squares.next().value).toEqual(125);
  });
});
