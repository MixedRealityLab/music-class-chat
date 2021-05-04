<style global lang="postcss">
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    @layer base {
        h1 {
            @apply text-2xl font-bold;
        }

        h2 {
            @apply text-xl font-bold;
        }

        body {
            color: #EEE;
            background: url("/backdrop.jpg") fixed;
        }

        a, button {
            transition: filter 0.5s, opacity 1s, background-color 1s;
	        background: #FFF0;
	        border-radius: 1rem;
        }

        input:disabled, button:disabled {
            opacity: 0.5;
        }

        a:hover, button:hover:enabled {
            filter: brightness(120%);
            -webkit-filter: brightness(120%);
	        background: #fff2;
        }


        input {
            color: #111;
        }
    }
</style>
