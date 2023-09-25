'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import { slugify } from '@/utils/slugify';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';

import styles from './writePage.module.css';
import { firebaseApp } from '@/utils/firebase';
import dynamic from 'next/dynamic';

const WritePage = () => {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState('');

  const [post, setPost] = useState({
    title: '',
    category: 'style',
  });

  const router = useRouter();

  const [file, setFile] = useState(null);
  const [media, setMedia] = useState('');

  const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

  //upload img file with firebase
  useEffect(() => {
    const uploadImgFile = () => {
      const storage = getStorage(firebaseApp);
      const imgName = new Date().getTime() + file.name;
      // const imgName = file.name;
      const storageRef = ref(storage, imgName);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        },
        (error) => {
          console.log('Upload failed', error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log('File available at', downloadURL);
            setMedia(downloadURL);
          });
        }
      );
    };
    file && uploadImgFile();
  }, [file]);

  if (status === 'loading') {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/');
  }

  const handleChange = (e) => {
    setPost({
      ...post,
      [e.currentTarget.name]: e.currentTarget.value,
    });
  };

  const handleSubmit = async () => {
    //call api to create a new post
    const response = await fetch(`/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug: slugify(post.title),
        title: post.title,
        desc,
        catSlug: post.category,
        image: media,
      }),
    });
    if (response.status === 200) {
      const result = await response.json();
      router.push(`/posts/${result.slug}`);
    }
  };

  console.log({ file });
  return (
    <div className={styles.container}>
      <input
        name="title"
        value={post.title}
        onChange={(event) => handleChange(event)}
        type="text"
        placeholder="Title"
        className={styles.input}
      />
      <select
        name="category"
        value={post.category}
        onChange={(event) => handleChange(event)}
        className={styles.select}
      >
        <option value="style">style</option>
        <option value="fashion">fashion</option>
        <option value="food">food</option>
        <option value="culture">culture</option>
        <option value="travel">travel</option>
        <option value="coding">coding</option>
      </select>
      <div className={styles.editor}>
        <button className={styles.button}>
          <Image
            onClick={() => setOpen(!open)}
            src="/plus.png"
            alt=""
            width={16}
            height={16}
          />
        </button>
        {open && (
          <div className={styles.add}>
            <input
              onChange={(e) => setFile(e.target.files[0])}
              type="file"
              id="image"
              style={{ display: 'none' }}
            />
            <button className={styles.addButton}>
              <label htmlFor="image">
                <Image src="/image.png" alt="" width={16} height={16} />
              </label>
            </button>
            <button className={styles.addButton}>
              <Image src="/external.png" alt="" width={16} height={16} />
            </button>
            <button className={styles.addButton}>
              <Image src="/video.png" alt="" width={16} height={16} />
            </button>
          </div>
        )}

        <ReactQuill
          value={desc}
          onChange={setDesc}
          className={styles.textArea}
          placeholder="Tell your story..."
          theme="snow"
        />
      </div>
      <button onClick={handleSubmit} className={styles.publish}>
        Publish
      </button>
    </div>
  );
};

export default WritePage;
