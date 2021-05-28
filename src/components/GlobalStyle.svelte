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
            background: url("../backdrop.jpg") fixed;
        }

        a, button, input[type='submit'] {
            @apply rounded-2xl;
            transition: filter 0.5s, opacity 0.5s, background-color 0.5s;
            background: #FFF0;
        }

        input:disabled, button:disabled {
            opacity: 0.5;
        }

        a:hover, button:hover:enabled, input[type='submit']:hover:enabled {
            filter: brightness(120%);
            -webkit-filter: brightness(120%);
            background: #fff2;
        }

        input {
            color: #111;
        }
    }
</style>
