<script>
	import { onMount } from "svelte";
  	import {page} from '$app/stores';
	import { current_component } from "svelte/internal";

	let showMenu = false;
    let current = 'home';
  
	function toggleNavbar() {
		showMenu = !showMenu;
	}
</script>

<div class="bg-middleblue">
    <div>
      <nav class="container bg-middleblue px-2 mx-auto md:flex md:justify-between md:items-center">
        <div class="flex items-center justify-between">
            <img src="/src/assets/logo3.png" class="h-16 mr-8 px-3 py-1" alt="Flowbite Logo" />
            <span class="self-center text-xl font-semibold whitespace-nowrap text-white">Ghosty's Super Maze</span>
         
            <div on:click={toggleNavbar} class="flex md:hidden">
                <button
                type="button"
                class="text-gray-800 hover:text-gray-400 focus:outline-none focus:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                </button>
            </div>
        </div>
        <div id="nav" class="flex-col mt-8 space-y-2 md:flex text-xl font-semibold md:space-y-0 md:flex-row ml-64 md:mt-0 {showMenu ? 'flex' : 'hidden'}">
        
            {#if current === 'maze'}
              <div class="text-gray-800 hover:text-middleblue">
                <a id="nav-item" class="nav-link whitespace-nowrap text-white" on:click="{() => current = 'home'}" href="/"> Go back Home</a>
              </div>
            {/if}
            {#if current === 'home'}
              <div class="text-gray-800 hover:text-middleblue">
                <a id="nav-item" class="nav-link whitespace-nowrap text-white" on:click="{() => current = 'maze'}" href="/maze">Start the Maze</a>
              </div>
            {/if}
        </div>
      </nav>
    </div>
  </div>