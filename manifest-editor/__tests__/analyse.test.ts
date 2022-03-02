import { analyse } from '../helpers/analyse';
import { Image } from '../helpers/analyse';

// analyse is an aysnc call so
test('If I give it an Image URL it will return an image object', () => {

  return analyse("https://picsum.photos/200/300").then((data) => {
    expect(data.type).toBe('Image');
  })
  // expect(await analyse("https://example.org/lunar-rover.jpg").type).toBe("Image");
  // expect(analyse("https://example.org/lunar-rover.jpg").id).toBe("https://example.org/lunar-rover.jpg");
});

